const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Coupon = require('../models/Coupon');
const { requireActivity } = require('../middleware/authMiddleware');

const router = express.Router();

const couponsFilePath = path.join(__dirname, '../data/coupons.json');
let initialCoupons = [
  { id: 'cpn_jewel10', code: 'JEWEL10', discountType: 'percentage', discountValue: 10, minPurchase: 0, description: '10% Off on Gross Purchase', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cpn_freeship', code: 'FREESHIP', discountType: 'flat', discountValue: 1500, minPurchase: 0, description: 'Free Insured Armored Delivery (₹1,500 Off)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cpn_save500', code: 'SAVE500', discountType: 'flat', discountValue: 500, minPurchase: 5000, description: '₹500 Flat Savings on ₹5,000+', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cpn_royal20', code: 'ROYAL20', discountType: 'percentage', discountValue: 20, minPurchase: 50000, description: '👑 Royal Master Offer: 20% Off on ₹50,000+', isActive: true, createdAt: new Date().toISOString() },
];

try {
  if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
  }
  if (fs.existsSync(couponsFilePath)) {
    initialCoupons = JSON.parse(fs.readFileSync(couponsFilePath, 'utf8'));
  } else {
    fs.writeFileSync(couponsFilePath, JSON.stringify(initialCoupons, null, 2));
  }
} catch (e) {}

const saveCouponsToFile = () => {
  try {
    fs.writeFileSync(couponsFilePath, JSON.stringify(initialCoupons, null, 2));
  } catch (e) {}
};

const MASTER_COUPON_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];

const isMasterAdmin = (email) => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const envMasters = (process.env.MASTER_ADMIN_EMAILS || '').toLowerCase().split(',').map(e => e.trim());
  return MASTER_COUPON_ADMINS.includes(clean) || envMasters.includes(clean);
};

// Seed coupons to MongoDB if connected
const seedCoupons = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Coupon.countDocuments();
      if (count === 0) {
        const docs = initialCoupons.map(c => ({
          couponId: c.id,
          code: c.code,
          discountType: c.discountType,
          discountValue: c.discountValue,
          minPurchase: c.minPurchase,
          description: c.description,
          isActive: c.isActive,
        }));
        await Coupon.insertMany(docs, { ordered: false });
        console.log('✅ Default promotional coupons seeded to MongoDB');
      }
    } catch (e) {}
  }
};
seedCoupons();

// GET /api/coupons/all — Fetch all coupons
router.get('/all', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const dbCoupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
        if (dbCoupons && dbCoupons.length > 0) {
          return res.json(dbCoupons.map(c => ({
            id: c.couponId || c._id,
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            minPurchase: c.minPurchase,
            description: c.description,
            isActive: c.isActive,
            createdAt: c.createdAt
          })));
        }
      } catch (e) {}
    }
    return res.json(initialCoupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/coupons/add — Creates a new coupon (Master Admin or Coupons manager)
router.post('/add', requireActivity('coupons'), async (req, res) => {
  try {

    const { code, discountType = 'percentage', discountValue, minPurchase = 0, description = '' } = req.body;
    if (!code || discountValue === undefined) {
      return res.status(400).json({ message: 'Coupon code and discount value are required' });
    }

    const cleanCode = code.toUpperCase().trim().replace(/\s+/g, '');

    // Check duplicate
    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await Coupon.findOne({ code: cleanCode });
        if (existing) return res.status(400).json({ message: `Coupon "${cleanCode}" already exists` });
      } catch (e) {}
    }
    const memExisting = initialCoupons.find(c => c.code === cleanCode);
    if (memExisting) return res.status(400).json({ message: `Coupon "${cleanCode}" already exists` });

    const newCouponId = `cpn_${Date.now()}`;
    const couponObj = {
      id: newCouponId,
      code: cleanCode,
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase) || 0,
      description,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await Coupon.create({
          couponId: newCouponId,
          code: cleanCode,
          discountType,
          discountValue: parseFloat(discountValue),
          minPurchase: parseFloat(minPurchase) || 0,
          description,
          isActive: true
        });
      } catch (e) {}
    }

    initialCoupons.unshift(couponObj);
    saveCouponsToFile();

    res.status(201).json({ message: `\u2705 Coupon "${cleanCode}" created successfully!`, coupon: couponObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/coupons/:id/toggle — Toggles active state
router.put('/:id/toggle', requireActivity('coupons'), async (req, res) => {
  try {

    const { id } = req.params;
    let updatedCoupon = null;

    if (mongoose.connection.readyState === 1) {
      try {
        let dbC = await Coupon.findOne({ $or: [{ couponId: id }, { code: id.toUpperCase() }] });
        if (dbC) {
          dbC.isActive = !dbC.isActive;
          await dbC.save();
          updatedCoupon = dbC.toObject();
        }
      } catch (e) {}
    }

    const idx = initialCoupons.findIndex(c => c.id === id || c.code === id.toUpperCase());
    if (idx !== -1) {
      initialCoupons[idx].isActive = !initialCoupons[idx].isActive;
      if (!updatedCoupon) updatedCoupon = initialCoupons[idx];
      saveCouponsToFile();
    }

    if (updatedCoupon) return res.json(updatedCoupon);
    res.status(404).json({ message: 'Coupon not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/coupons/:id — Deletes a coupon
router.delete('/:id', requireActivity('coupons'), async (req, res) => {
  try {

    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      try {
        await Coupon.findOneAndDelete({ $or: [{ couponId: id }, { code: id.toUpperCase() }] });
      } catch (e) {}
    }

    const idx = initialCoupons.findIndex(c => c.id === id || c.code === id.toUpperCase());
    if (idx !== -1) {
      initialCoupons.splice(idx, 1);
      saveCouponsToFile();
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
