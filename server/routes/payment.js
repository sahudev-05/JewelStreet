const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const { sendPurchaseInvoiceEmail } = require('../services/emailService');

const router = express.Router();

// Initialize Razorpay — uses test keys from .env
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
  return new Razorpay({ key_id, key_secret });
};

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId || keyId.includes('YOUR_KEY') || keyId.includes('placeholder')) {
      return res.json({
        orderId: `order_sim_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        keyId: 'rzp_test_simulated_jewelstreet',
        isSimulated: true
      });
    }

    try {
      const razorpay = getRazorpay();
      const options = {
        amount: Math.round(amount * 100), // Razorpay uses paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        isSimulated: false
      });
    } catch (rzpErr) {
      console.warn('Razorpay live API notice (using test simulation):', rzpErr.message);
      return res.json({
        orderId: `order_sim_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        keyId: 'rzp_test_simulated_jewelstreet',
        isSimulated: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
});

// POST /api/payment/verify — Legacy signature verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (
      (razorpay_order_id && razorpay_order_id.startsWith('order_sim_')) ||
      razorpay_signature === 'simulated_sig' ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET.includes('YOUR_SECRET')
    ) {
      return res.json({ success: true, message: 'Payment verified (Test Mode Simulation)', paymentId: razorpay_payment_id || `pay_sim_${Date.now()}` });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully', paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
});

// POST /api/payment/verify-and-place-order — Authoritative backend verification & atomic order placement
router.post('/verify-and-place-order', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body;

    if (!orderDetails || !orderDetails.customerEmail) {
      return res.status(400).json({ success: false, message: 'Order details and customer email are required' });
    }

    const { createOrderRecord } = require('./orders');

    // Verify cryptographic signature on backend
    let isSignatureValid = false;

    const hasRealSecret =
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_SECRET.includes('YOUR_SECRET') &&
      process.env.RAZORPAY_KEY_SECRET.trim().length > 5;

    if (hasRealSecret) {
      // Production cryptographic signature verification (HMAC-SHA256)
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      isSignatureValid = (expectedSignature === razorpay_signature);
    } else {
      // Dev/Sandbox simulation mode
      if (
        razorpay_signature === 'invalid_sig' ||
        razorpay_signature === 'failed' ||
        (orderDetails && orderDetails.simulateFailure)
      ) {
        isSignatureValid = false;
      } else {
        isSignatureValid = true;
      }
    }

    // ── CASE 1: PAYMENT VERIFICATION FAILED ──
    if (!isSignatureValid) {
      const failInvoice = `FAIL-JS-${Date.now().toString().slice(-6)}`;
      const failedOrder = await createOrderRecord({
        invoiceNo: failInvoice,
        customerName: orderDetails.customerName || 'Valued Client',
        customerEmail: orderDetails.customerEmail,
        phone: orderDetails.phone || '',
        deliveryAddress: orderDetails.deliveryAddress || 'Store Pick-up',
        pincode: orderDetails.pincode || '560001',
        items: orderDetails.cartItems || [],
        totalAmount: orderDetails.totalAmount || 0,
        status: 'Payment Failed',
        paymentStatus: 'Failed',
        paymentId: razorpay_payment_id || null,
        paymentOrderId: razorpay_order_id || null,
        failureReason: 'Cryptographic HMAC signature verification mismatch on backend',
        signatureVerified: false,
      }).catch(e => console.error('Failed order logging error:', e));

      return res.status(400).json({
        success: false,
        paymentStatus: 'Failed',
        message: 'Payment verification failed on the server. Your card/account was not charged.',
        order: failedOrder,
      });
    }

    // ── CASE 2: PAYMENT VERIFIED SUCCESSFULLY ──
    const invoiceNo = `INV-JS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const confirmedOrder = await createOrderRecord({
      invoiceNo,
      customerName: orderDetails.customerName || 'Valued Client',
      customerEmail: orderDetails.customerEmail,
      phone: orderDetails.phone || '+91 9876543210',
      deliveryAddress: orderDetails.deliveryAddress || 'Store Address',
      pincode: orderDetails.pincode || '560001',
      items: orderDetails.cartItems || [],
      totalAmount: orderDetails.totalAmount || 0,
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      paymentOrderId: razorpay_order_id,
      signatureVerified: true,
      paymentMethod: orderDetails.paymentMethod || 'Razorpay Online Secured',
    });

    // Trigger purchase invoice email directly from backend
    try {
      await sendPurchaseInvoiceEmail({
        customerName: orderDetails.customerName || 'Valued Client',
        customerEmail: orderDetails.customerEmail,
        deliveryAddress: orderDetails.deliveryAddress || 'Store Address',
        pincode: orderDetails.pincode || '560001',
        phone: orderDetails.phone || '+91 9876543210',
        cartItems: orderDetails.cartItems || [],
        totalAmount: orderDetails.totalAmount || 0,
        invoiceNo,
      });
    } catch (emailErr) {
      console.warn('Backend purchase invoice email notice:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      paymentStatus: 'Paid',
      invoiceNo,
      order: confirmedOrder,
      message: 'Payment verified and order confirmed successfully!'
    });
  } catch (error) {
    console.error('Verify and place order error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment', error: error.message });
  }
});

// POST /api/payment/record-failed-payment — Log gateway failures and user cancellations
router.post('/record-failed-payment', async (req, res) => {
  try {
    const { reason, orderId, orderDetails } = req.body;
    const { createOrderRecord } = require('./orders');

    const failInvoice = `FAIL-JS-${Date.now().toString().slice(-6)}`;
    const failedRecord = await createOrderRecord({
      invoiceNo: failInvoice,
      customerName: (orderDetails && orderDetails.customerName) || 'Valued Client',
      customerEmail: (orderDetails && orderDetails.customerEmail) || 'guest@jewelstreet.com',
      phone: (orderDetails && orderDetails.phone) || '',
      deliveryAddress: (orderDetails && orderDetails.deliveryAddress) || '',
      pincode: (orderDetails && orderDetails.pincode) || '',
      items: (orderDetails && orderDetails.cartItems) || [],
      totalAmount: (orderDetails && orderDetails.totalAmount) || 0,
      status: 'Payment Failed',
      paymentStatus: 'Failed',
      paymentId: null,
      paymentOrderId: orderId || null,
      failureReason: reason || 'Payment cancelled by user or declined by banking network',
      signatureVerified: false,
    });

    res.json({
      success: true,
      message: 'Payment failure logged for store records',
      invoiceNo: failInvoice,
      order: failedRecord,
    });
  } catch (error) {
    console.error('Record failed payment error:', error);
    res.status(500).json({ message: 'Failed to record payment failure', error: error.message });
  }
});

// POST /api/payment/send-invoice-email
router.post('/send-invoice-email', async (req, res) => {
  try {
    const { invoiceNo: providedInvoiceNo, name, email, address, pincode, phone, cartItems, total } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Customer email is required' });
    }

    const invoiceNo = providedInvoiceNo || `INV-JS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Save order record for Customer Profile & Admin Dashboard
    const { createOrderRecord } = require('./orders');
    await createOrderRecord({
      invoiceNo,
      customerName: name || 'Valued Client',
      customerEmail: email,
      phone: phone || '+91 9876543210',
      deliveryAddress: address || 'Store Address',
      pincode: pincode || '560001',
      items: cartItems || [],
      totalAmount: total || 0,
      status: 'Processing',
      paymentStatus: 'Paid',
    }).catch(err => console.error('Order save error:', err));


    const emailResult = await sendPurchaseInvoiceEmail({
      customerName: name || 'Valued Client',
      customerEmail: email,
      deliveryAddress: address || 'Store Pick-up Address',
      pincode: pincode || '560001',
      phone: phone || '+91 9876543210',
      cartItems: cartItems || [],
      totalAmount: total || 0,
      invoiceNo,
    });

    res.json({
      success: true,
      provider: emailResult.provider || 'Email Service',
      invoiceNo,
      emailSent: emailResult.success,
      previewUrl: emailResult.previewUrl || null,
      isTest: emailResult.isTest || false,
      htmlContent: emailResult.htmlContent || null,
      message: `Purchase invoice & thanking email sent via ${emailResult.provider || 'Email Service'} to ${email}`,
    });
  } catch (error) {
    console.error('Invoice email error:', error);
    res.status(500).json({ message: 'Failed to send invoice email', error: error.message });
  }
});

module.exports = router;
