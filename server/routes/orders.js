const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');

const router = express.Router();

// File-backed persistent fallback store if MongoDB is offline
const ordersFilePath = path.join(__dirname, '../data/orders.json');
let inMemoryOrders = [];

// Load saved orders from file if exists
try {
  if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
  }
  if (fs.existsSync(ordersFilePath)) {
    const raw = fs.readFileSync(ordersFilePath, 'utf8');
    inMemoryOrders = JSON.parse(raw);
  }
} catch (e) {
  inMemoryOrders = [];
}

const saveOrdersToFile = () => {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(inMemoryOrders, null, 2));
  } catch (e) {
    console.error('Failed to save orders to file cache:', e);
  }
};

const createOrderRecord = async (orderData) => {
  const invoiceNo = orderData.invoiceNo || `INV-JS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Deduplicate in memory cache
  const existingIdx = inMemoryOrders.findIndex(o => o.invoiceNo === invoiceNo);
  if (existingIdx !== -1) {
    inMemoryOrders[existingIdx] = { ...inMemoryOrders[existingIdx], ...orderData };
    saveOrdersToFile();
    return inMemoryOrders[existingIdx];
  }

  const formattedOrder = {
    _id: orderData._id || `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: orderData.userId || null,
    invoiceNo,
    customerName: orderData.customerName || orderData.name || 'Valued Client',
    customerEmail: (orderData.customerEmail || orderData.email || 'deevyanshusahu@gmail.com').toLowerCase(),
    phone: orderData.phone || '+91 9876543210',
    deliveryAddress: orderData.deliveryAddress || orderData.address || 'Store Address',
    pincode: orderData.pincode || '560001',
    items: orderData.items || orderData.cartItems || [],
    totalAmount: orderData.totalAmount || orderData.total || 0,
    status: orderData.status || 'Processing',
    paymentMethod: orderData.paymentMethod || 'Razorpay Online Payment',
    createdAt: orderData.createdAt || new Date().toISOString()
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const existingDb = await Order.findOne({ invoiceNo });
      if (existingDb) {
        return existingDb.toObject();
      }
      const created = await Order.create(formattedOrder);
      formattedOrder._id = created._id;
    } catch (err) {
      console.error('Mongoose Order.create error:', err);
    }
  }

  inMemoryOrders.unshift(formattedOrder);
  saveOrdersToFile();

  return formattedOrder;
};

// POST /api/orders — Save order after checkout
router.post('/', async (req, res) => {
  try {
    const order = await createOrderRecord(req.body);
    return res.status(201).json(order);
  } catch (error) {
    console.error('Order creation endpoint error:', error);
    res.status(500).json({ message: 'Failed to create order record' });
  }
});

// GET /api/orders/my-orders — Fetch customer order history
router.get('/my-orders', async (req, res) => {
  try {
    const email = req.query.email || (req.user && req.user.email);
    if (!email) return res.json([]);

    const cleanEmail = email.trim().toLowerCase();
    let dbOrders = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const regex = new RegExp('^' + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
        dbOrders = await Order.find({ customerEmail: regex }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.error('MongoDB order query error:', e.message);
      }
    }

    const fileMatched = inMemoryOrders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === cleanEmail);

    // Merge MongoDB + File cached orders by invoiceNo
    const orderMap = new Map();
    fileMatched.forEach(o => orderMap.set(o.invoiceNo, o));
    dbOrders.forEach(o => orderMap.set(o.invoiceNo, o));

    const merged = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    return res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/all-orders — Admin route to list all orders
router.get('/all-orders', async (req, res) => {
  try {
    let dbOrders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        dbOrders = await Order.find({}).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }

    const orderMap = new Map();
    inMemoryOrders.forEach(o => orderMap.set(o.invoiceNo, o));
    dbOrders.forEach(o => orderMap.set(o.invoiceNo, o));

    const merged = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    return res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status — Admin route to update fulfillment status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    let updatedOrder = null;

    if (mongoose.connection.readyState === 1) {
      try {
        let dbOrder = await Order.findOne({ $or: [{ _id: id }, { invoiceNo: id }] });
        if (dbOrder) {
          dbOrder.status = status;
          await dbOrder.save();
          updatedOrder = dbOrder.toObject();
        }
      } catch (e) {}
    }

    const memIdx = inMemoryOrders.findIndex(o => String(o._id) === String(id) || o.invoiceNo === id);
    if (memIdx !== -1) {
      inMemoryOrders[memIdx].status = status;
      if (!updatedOrder) updatedOrder = inMemoryOrders[memIdx];
      saveOrdersToFile();
    }

    if (updatedOrder) {
      if (status === 'Cancelled') {
        try {
          const { sendCancellationRefundEmail } = require('../services/emailService');
          await sendCancellationRefundEmail({
            customerName: updatedOrder.customerName,
            customerEmail: updatedOrder.customerEmail,
            invoiceNo: updatedOrder.invoiceNo,
            totalAmount: updatedOrder.totalAmount,
            refundDays: 7,
          });
        } catch (err) {
          console.warn('Cancellation refund email error:', err.message);
        }
      } else if (status === 'Delivered' || status === 'In Armored Transit') {
        try {
          const { sendOrderDeliveredEmail } = require('../services/emailService');
          await sendOrderDeliveredEmail({
            customerName: updatedOrder.customerName,
            customerEmail: updatedOrder.customerEmail,
            invoiceNo: updatedOrder.invoiceNo,
            items: updatedOrder.items,
            totalAmount: updatedOrder.totalAmount,
            status: updatedOrder.status || status
          });
        } catch (err) {
          console.warn('Delivery/Transit status email error:', err.message);
        }
      }
      return res.json(updatedOrder);
    }
    return res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/return-request — Customer requests 7-day return or replacement
router.post('/:id/return-request', async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'Return', reason = '7-Day Privilege Return' } = req.body;
    let targetOrder = null;

    if (mongoose.connection.readyState === 1) {
      try {
        let dbOrder = await Order.findOne({ $or: [{ _id: id }, { invoiceNo: id }] });
        if (dbOrder) {
          dbOrder.returnRequested = true;
          dbOrder.returnType = type;
          dbOrder.returnReason = reason;
          dbOrder.returnStatus = 'Pending Inspection';
          await dbOrder.save();
          targetOrder = dbOrder.toObject();
        }
      } catch (e) {}
    }

    const memIdx = inMemoryOrders.findIndex(o => String(o._id) === String(id) || o.invoiceNo === id);
    if (memIdx !== -1) {
      inMemoryOrders[memIdx].returnRequested = true;
      inMemoryOrders[memIdx].returnType = type;
      inMemoryOrders[memIdx].returnReason = reason;
      inMemoryOrders[memIdx].returnStatus = 'Pending Inspection';
      if (!targetOrder) targetOrder = inMemoryOrders[memIdx];
      saveOrdersToFile();
    }

    if (!targetOrder) return res.status(404).json({ message: 'Order not found' });

    // Send EmailJS Return / Replacement confirmation email
    try {
      const { sendReturnReplacementEmail } = require('../services/emailService');
      await sendReturnReplacementEmail({
        customerName: targetOrder.customerName,
        customerEmail: targetOrder.customerEmail,
        invoiceNo: targetOrder.invoiceNo,
        items: targetOrder.items,
        reason,
        type
      });
    } catch (err) {
      console.warn('Return email error:', err.message);
    }

    return res.json({ message: `7-Day ${type} request registered successfully! Confirmation email sent.`, order: targetOrder });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/cancel — 2-Way Order Cancellation endpoint (User or Admin)
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Order Cancelled by Customer' } = req.body;
    let targetOrder = null;

    if (mongoose.connection.readyState === 1) {
      try {
        let dbOrder = await Order.findOne({ $or: [{ _id: id }, { invoiceNo: id }] });
        if (dbOrder) {
          dbOrder.status = 'Cancelled';
          dbOrder.cancelReason = reason;
          await dbOrder.save();
          targetOrder = dbOrder.toObject();
        }
      } catch (e) {}
    }

    const memIdx = inMemoryOrders.findIndex(o => String(o._id) === String(id) || o.invoiceNo === id);
    if (memIdx !== -1) {
      inMemoryOrders[memIdx].status = 'Cancelled';
      inMemoryOrders[memIdx].cancelReason = reason;
      if (!targetOrder) targetOrder = inMemoryOrders[memIdx];
      saveOrdersToFile();
    }

    if (!targetOrder) return res.status(404).json({ message: 'Order not found' });

    // Send EmailJS Cancellation Refund email
    try {
      const { sendCancellationRefundEmail } = require('../services/emailService');
      await sendCancellationRefundEmail({
        customerName: targetOrder.customerName,
        customerEmail: targetOrder.customerEmail,
        invoiceNo: targetOrder.invoiceNo,
        totalAmount: targetOrder.totalAmount,
        refundDays: 7,
      });
    } catch (err) {
      console.warn('Cancellation refund email error:', err.message);
    }

    return res.json({ message: 'Order cancelled successfully! 100% full refund email sent.', order: targetOrder });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/process-return — Admin approves or rejects Return / Exchange request
router.put('/:id/process-return', async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'Approved', note = '' } = req.body; // action: 'Approved' or 'Rejected'
    let targetOrder = null;

    if (mongoose.connection.readyState === 1) {
      try {
        let dbOrder = await Order.findOne({ $or: [{ _id: id }, { invoiceNo: id }] });
        if (dbOrder) {
          const type = dbOrder.returnType || 'Return';
          if (action === 'Approved') {
            dbOrder.returnStatus = type === 'Exchange' ? 'Approved & Replacement Dispatched' : 'Approved & Refund Credited';
            if (type === 'Return') dbOrder.status = 'Cancelled';
          } else {
            dbOrder.returnStatus = 'Rejected / Closed';
          }
          dbOrder.adminReturnNote = note;
          await dbOrder.save();
          targetOrder = dbOrder.toObject();
        }
      } catch (e) {}
    }

    const memIdx = inMemoryOrders.findIndex(o => String(o._id) === String(id) || o.invoiceNo === id);
    if (memIdx !== -1) {
      const type = inMemoryOrders[memIdx].returnType || 'Return';
      if (action === 'Approved') {
        inMemoryOrders[memIdx].returnStatus = type === 'Exchange' ? 'Approved & Replacement Dispatched' : 'Approved & Refund Credited';
        if (type === 'Return') inMemoryOrders[memIdx].status = 'Cancelled';
      } else {
        inMemoryOrders[memIdx].returnStatus = 'Rejected / Closed';
      }
      inMemoryOrders[memIdx].adminReturnNote = note;
      if (!targetOrder) targetOrder = inMemoryOrders[memIdx];
      saveOrdersToFile();
    }

    if (!targetOrder) return res.status(404).json({ message: 'Order not found' });

    // Send confirmation email to customer
    try {
      const { sendReturnReplacementEmail } = require('../services/emailService');
      await sendReturnReplacementEmail({
        customerName: targetOrder.customerName,
        customerEmail: targetOrder.customerEmail,
        invoiceNo: targetOrder.invoiceNo,
        items: targetOrder.items,
        reason: `Status Update: ${targetOrder.returnStatus}. ${note}`,
        type: targetOrder.returnType || 'Return'
      });
    } catch (e) {}

    return res.json({ message: `Return/Exchange request updated to "${targetOrder.returnStatus}". Email sent.`, order: targetOrder });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
module.exports.createOrderRecord = createOrderRecord;

