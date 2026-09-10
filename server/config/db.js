const dns = require('dns');
const mongoose = require('mongoose');

// Ensure Atlas SRV records resolve reliably on Windows and diverse ISP/local DNS configurations
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server fallback notice:', dnsErr.message);
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set in .env — running without database.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Will auto-reconnect...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    // Seed initial data and sync any local offline records
    await seedInitialData();
    await syncPendingLocalData();

  } catch (error) {
    console.warn(`⚠️  MongoDB not connected: ${error.message}`);
    console.warn('   Using file-based fallback storage for products & orders.');
  }
};

// Seed products + master admin if not already present
const seedInitialData = async () => {
  try {
    await seedProducts();
    await seedMasterAdmin();
  } catch (e) {
    console.warn('⚠️  Seed error:', e.message);
  }
};

// Automatically sync orders and support tickets from local disk into MongoDB
const syncPendingLocalData = async () => {
  try {
    const fs = require('fs');
    const path = require('path');

    // 1. Sync orders
    const Order = require('../models/Order');
    const ordersFilePath = path.join(__dirname, '../data/orders.json');
    if (fs.existsSync(ordersFilePath)) {
      const orders = JSON.parse(fs.readFileSync(ordersFilePath, 'utf8') || '[]');
      let syncedOrders = 0;
      for (const ord of orders) {
        if (!ord.invoiceNo) continue;
        const exists = await Order.findOne({ invoiceNo: ord.invoiceNo });
        if (!exists) {
          await Order.create(ord);
          syncedOrders++;
        }
      }
      if (syncedOrders > 0) {
        console.log(`✅ Synchronized ${syncedOrders} local orders into MongoDB Atlas`);
      }
    }

    // 2. Sync support tickets
    const CustomerQuery = require('../models/CustomerQuery');
    const supportFilePath = path.join(__dirname, '../data/support_tickets.json');
    if (fs.existsSync(supportFilePath)) {
      const tickets = JSON.parse(fs.readFileSync(supportFilePath, 'utf8') || '[]');
      let syncedTickets = 0;
      for (const tkt of tickets) {
        if (!tkt.ticketId) continue;
        const exists = await CustomerQuery.findOne({ ticketId: tkt.ticketId });
        if (!exists) {
          await CustomerQuery.create(tkt);
          syncedTickets++;
        }
      }
      if (syncedTickets > 0) {
        console.log(`✅ Synchronized ${syncedTickets} support tickets into MongoDB Atlas`);
      }
    }
  } catch (err) {
    console.warn('⚠️  Data sync notice:', err.message);
  }
};

const seedProducts = async () => {
  try {
    const Product = require('../models/Product');
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`📦 MongoDB Products: ${count} already seeded, skipping.`);
      return;
    }

    // Load from JSON file or inline catalog
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, '../data/products.json');

    let catalog = {};
    if (fs.existsSync(jsonPath)) {
      catalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }

    if (Object.keys(catalog).length === 0) {
      // Load from the products route's in-memory catalog
      console.log('📦 No products.json found, loading from route catalog...');
      return;
    }

    const docs = [];
    Object.keys(catalog).forEach(cat => {
      catalog[cat].forEach(p => {
        docs.push({
          productId: p.id,
          name: p.name,
          category: cat,
          purity: p.purity || '91.6%',
          weight: p.weight || 5.0,
          price: p.price || '₹45,000',
          image: p.image || '/photos/product1.jpg',
          description: p.description || '',
          stock: p.stock !== undefined ? p.stock : 12,
          rating: p.rating || 4.8,
          reviewCount: p.reviewCount || 0,
          reviews: (p.reviews || []).map(r => ({
            id: r.id, author: r.author, rating: r.rating,
            date: r.date, title: r.title, comment: r.comment
          }))
        });
      });
    });

    if (docs.length > 0) {
      await Product.insertMany(docs, { ordered: false });
      console.log(`✅ Seeded ${docs.length} products into MongoDB`);
    }
  } catch (e) {
    if (e.code === 11000) {
      console.log('📦 Products already seeded (duplicate key).');
    } else {
      console.warn('⚠️  Product seed error:', e.message);
    }
  }
};

const seedMasterAdmin = async () => {
  try {
    const Admin = require('../models/Admin');
    const existing = await Admin.findOne({ role: 'master_admin' });
    if (!existing) {
      await Admin.create({
        adminId: 'admin_deevyanshu_2026',
        name: 'Deevyanshu Sahu',
        email: 'deevyanshusahu@gmail.com',
        role: 'master_admin',
      });
      console.log('✅ Master admin seeded to MongoDB');
    }
  } catch (e) {
    if (e.code !== 11000) console.warn('⚠️  Admin seed error:', e.message);
  }
};

module.exports = connectDB;
