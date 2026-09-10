const mongoose = require('mongoose');

const customerQuerySchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true },
  customerPhone: { type: String, default: '' },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Order & Delivery',
      'Payment & Invoice',
      'Purity & BIS Hallmark',
      'Return & Exchange',
      'Custom Design Request',
      'General Concierge'
    ],
    default: 'General Concierge'
  },
  message: { type: String, required: true },
  orderNo: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  resolutionNotes: { type: String, default: '' },
  resolvedBy: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('CustomerQuery', customerQuerySchema);
