const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, default: null },
  invoiceNo: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  phone: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  pincode: { type: String, required: true },
  items: [
    {
      productId: String,
      name: String,
      price: String,
      weight: String,
      purity: String,
      image: String,
      quantity: { type: Number, default: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Processing', 'In Armored Transit', 'Delivered', 'Cancelled', 'Payment Failed', 'Paid'],
    default: 'Processing'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Failed', 'Pending'],
    default: 'Pending'
  },
  paymentId: { type: String, default: null },
  paymentOrderId: { type: String, default: null },
  failureReason: { type: String, default: null },
  signatureVerified: { type: Boolean, default: false },
  paymentMethod: { type: String, default: 'Razorpay UPI / Card / NetBanking' },
  returnRequested: { type: Boolean, default: false },
  returnType: { type: String, default: null }, // 'Return' | 'Replacement'
  returnReason: { type: String, default: null },
  returnStatus: { type: String, default: null }, // 'Pending Inspection' | 'Approved' | 'Completed'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
