require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const favouritesRoutes = require('./routes/favourites');
const productsRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');
const ordersRoutes = require('./routes/orders');
const couponsRoutes = require('./routes/coupons');
const supportRoutes = require('./routes/support');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://jewel-street.vercel.app',
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
  ],
  credentials: true,
}));
app.use(express.json());

// Global database connection middleware to ensure Mongoose is ready before any route executes
app.use(async (req, res, next) => {
  if (require('mongoose').connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('DB connection middleware warning:', err.message);
    }
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/support', supportRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Jewel Street API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Jewel Street Server running on http://localhost:${PORT}`);
});
