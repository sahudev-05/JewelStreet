const express = require('express');
const Favourites = require('../models/Favourites');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/favourites
router.get('/', protect, async (req, res) => {
  try {
    let favs = await Favourites.findOne({ userId: req.user._id });
    if (!favs) favs = { items: [] };
    res.json(favs.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/favourites/toggle
router.post('/toggle', protect, async (req, res) => {
  try {
    const { productId, name, image, purity, weight, price, category } = req.body;
    let favs = await Favourites.findOne({ userId: req.user._id });
    if (!favs) {
      favs = new Favourites({ userId: req.user._id, items: [] });
    }
    const existingIndex = favs.items.findIndex(item => item.productId === productId);
    let isFavourited;
    if (existingIndex >= 0) {
      favs.items.splice(existingIndex, 1);
      isFavourited = false;
    } else {
      favs.items.push({ productId, name, image, purity, weight, price, category });
      isFavourited = true;
    }
    await favs.save();
    res.json({ items: favs.items, isFavourited });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/favourites/ids — just returns array of favourite productIds
router.get('/ids', protect, async (req, res) => {
  try {
    let favs = await Favourites.findOne({ userId: req.user._id });
    if (!favs) return res.json([]);
    res.json(favs.items.map(i => i.productId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
