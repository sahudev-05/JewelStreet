const mongoose = require('mongoose');

const favouriteItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  purity: { type: String },
  weight: { type: String },
  price: { type: String },
  category: { type: String },
});

const favouritesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [favouriteItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Favourites', favouritesSchema);
