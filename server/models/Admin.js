const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // stored in plain text for admin portal (hashed via User model for login)
  role: { type: String, enum: ['master_admin', 'admin'], default: 'admin' },
  assignedRole: { type: String, default: 'inventory_manager' }, // e.g. inventory_manager, order_manager, support_specialist, customer_manager, reports_analyst, promotions_manager, store_operations, custom
  allowedActivities: { type: [String], default: ['inventory'] }, // subset of: ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins']
  mustChangePassword: { type: Boolean, default: true },
  resetPasswordOtp: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
