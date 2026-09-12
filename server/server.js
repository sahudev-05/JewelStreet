const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://jewel-street.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Global database connection middleware to ensure Mongoose is ready before any route executes
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('DB connection middleware warning:', err.message);
    }
  }
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payment");
const couponRoutes = require("./routes/coupons");
const favouriteRoutes = require("./routes/favourites");
const supportRoutes = require("./routes/support");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/support", supportRoutes);

// Health & Status
app.get("/", (req, res) => {
  res.json({
    message: "JewelStreet Backend Running",
    dbConnected: mongoose.connection.readyState === 1
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Jewel Street API running",
    dbConnected: mongoose.connection.readyState === 1
  });
});

// Proactively initiate DB connection
connectDB().catch(err => console.warn('Initial connect warning:', err.message));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;