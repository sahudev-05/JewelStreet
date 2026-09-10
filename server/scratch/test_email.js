require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sendPurchaseInvoiceEmail, sendAdminWelcomeEmail, sendReturnReplacementEmail, sendCancellationRefundEmail } = require('../services/emailService');

async function test() {
  console.log('Testing sendPurchaseInvoiceEmail...');
  const res1 = await sendPurchaseInvoiceEmail({
    customerName: 'Deevyanshu Sahu',
    customerEmail: 'deevyanshusahu@gmail.com',
    deliveryAddress: '123 Royal Palace, MG Road',
    pincode: '560001',
    phone: '9876543210',
    cartItems: [
      { id: 'prod_1', name: 'Royal Gold Ring 22K', price: '₹85,000', purity: '22K Gold', weight: '12g' }
    ],
    totalAmount: 85000,
    invoiceNo: 'INV-TEST-2026-001'
  });
  console.log('Result 1:', res1);

  console.log('Testing sendAdminWelcomeEmail...');
  const res2 = await sendAdminWelcomeEmail({
    name: 'New Royal Admin',
    email: 'deevyanshusahu@gmail.com',
    password: 'SecurePass123!',
    role: 'admin'
  });
  console.log('Result 2:', res2);

  console.log('Testing sendReturnReplacementEmail...');
  const res3 = await sendReturnReplacementEmail({
    customerName: 'Deevyanshu Sahu',
    customerEmail: 'deevyanshusahu@gmail.com',
    invoiceNo: 'INV-TEST-2026-001',
    items: [{ name: 'Royal Gold Ring 22K' }],
    reason: 'Size adjustment requested',
    type: 'Return'
  });
  console.log('Result 3:', res3);

  console.log('Testing sendCancellationRefundEmail...');
  const res4 = await sendCancellationRefundEmail({
    customerName: 'Deevyanshu Sahu',
    customerEmail: 'deevyanshusahu@gmail.com',
    invoiceNo: 'INV-TEST-2026-001',
    totalAmount: 85000,
    refundDays: 7
  });
  console.log('Result 4:', res4);
}

test();
