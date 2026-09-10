const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: Number,
  author: String,
  rating: Number,
  date: String,
  title: String,
  comment: String,
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true }, // e.g. 'ring1', 'necklace2'
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, lowercase: true, trim: true, index: true },
  purity: { type: String, default: '91.6%' },
  weight: { type: Number, default: 5.0 },
  price: { type: String, default: '₹45,000' },
  image: { type: String, default: '/photos/product1.jpg' },
  description: { type: String, default: '' },
  stock: { type: Number, default: 12, min: 0 },
  makingChargePercent: { type: Number, default: 18 },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews: [reviewSchema],
}, { timestamps: true });

// Index for fast category queries
productSchema.index({ category: 1, productId: 1 });

module.exports = mongoose.model('Product', productSchema);
