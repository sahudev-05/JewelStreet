const express = require('express');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = { items: [] };
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cart/add
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, name, image, purity, weight, price, category } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }
    const existingItem = cart.items.find(item => item.productId === productId);
    if (!existingItem) {
      cart.items.push({ productId, name, image, purity, weight, price, category });
    }
    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.json([]);
    cart.items = cart.items.filter(item => item.productId !== req.params.productId);
    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { upsert: true }
    );
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
