# 👑 Jewel Street Haute Joaillerie — Complete Codebase Architecture Guide

Welcome to the architectural documentation for **Jewel Street Haute Joaillerie**, a luxury e-commerce web platform. This document provides a detailed, file-by-file explanation of the entire project so developers, designers, and administrators can navigate, maintain, and extend the system effortlessly.

---

## 🏛️ High-Level System Architecture

The project is organized into two primary applications running in tandem:
1. **Frontend (`client/`)**: A React 18 single-page application built with Vite, styled with vanilla luxury CSS, dynamic modals, and client-side integrations (EmailJS, Razorpay, PDF/Excel export).
2. **Backend (`server/`)**: A Node.js + Express REST API backed by MongoDB Atlas (with local JSON data redundancy), cryptographic JWT authentication, Razorpay HMAC-SHA256 signature verification, and automated email services.

```
jewelry-ecommerce-main/
├── client/                     # React + Vite Frontend
│   ├── public/                 # Static public assets (logo.png, etc.)
│   ├── src/
│   │   ├── assets/             # Brand graphics & images
│   │   ├── components/         # Reusable luxury UI components
│   │   ├── context/            # Global state (Auth, Cart, Favourites)
│   │   ├── pages/              # Main view screens & dashboard
│   │   ├── services/           # External API & utility services
│   │   ├── App.jsx             # Root routing and application assembly
│   │   ├── index.css           # Global tokens, typography & CSS reset
│   │   └── main.jsx            # Vite DOM entry point
│   ├── index.html              # HTML shell & font definitions
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration & proxy settings
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # Database connection & DNS resolver
│   ├── data/                   # JSON fallback data & initial seed data
│   ├── middleware/             # Route guards & JWT authentication
│   ├── models/                 # Mongoose schema definitions
│   ├── routes/                 # Express REST API endpoints
│   ├── services/               # EmailJS & transactional email engine
│   ├── .env                    # Environment variables & secrets
│   ├── index.js                # Server entry point
│   └── package.json            # Backend dependencies
│
├── CODEBASE_GUIDE.md           # (This File) Complete codebase directory guide
└── DATABASE_AND_CONFIGURATION_GUIDE.md # MongoDB, Atlas, and environment setup guide
```

---

## 💻 Frontend Application (`client/`)

### 1. Root Application Files
- **[`client/src/main.jsx`](file:///d:/jewelry-ecommerce-main/client/src/main.jsx)**: The JavaScript entry point. Mounts the React application into `<div id="root">` inside `index.html`.
- **[`client/src/App.jsx`](file:///d:/jewelry-ecommerce-main/client/src/App.jsx)**: Central application hub. Wraps the app with `AuthProvider`, `CartProvider`, and `FavouritesProvider`. Configures React Router (`react-router-dom`) with routes for all pages:
  - `/` ➔ Home
  - `/category/:cat` ➔ Category Product Listing
  - `/cart` ➔ Shopping Cart & Checkout
  - `/login` ➔ Customer & Admin Login
  - `/profile` ➔ Customer Account & Orders
  - `/admin` ➔ Executive Admin Dashboard
  - `/favourites` ➔ Wishlist
  - `/gold-rate` ➔ Live BIS Gold Rates
  - `/about`, `/contact`, `/privacy`, `/terms`, etc. ➔ Policy and static content
- **[`client/src/index.css`](file:///d:/jewelry-ecommerce-main/client/src/index.css)**: The core design system. Defines CSS custom properties (color tokens like `#090029` royal dark blue, `#e6b97e` champagne gold, `#d5ccf0` lavender, and font stacks: Playfair Display, Cinzel, Montserrat, and Georgia).
- **[`client/vite.config.js`](file:///d:/jewelry-ecommerce-main/client/vite.config.js)**: Configures Vite development server, port `5173`, and reverse proxy forwarding `/api` calls to the Node.js backend on `http://localhost:5000`.
- **[`client/public/logo.png`](file:///d:/jewelry-ecommerce-main/client/public/logo.png)**: The official high-resolution Jewel Street emblem and solitaire crown crest.

---

### 2. UI Components (`client/src/components/`)

- **[`Header.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/Header.jsx) & [`Header.css`](file:///d:/jewelry-ecommerce-main/client/src/components/Header.css)**:
  - Top navigation bar featuring the brand crest, live search bar with instant autocomplete, Wishlist badge count, Shopping Bag badge count, and user account icon.
  - Interactive profile dropdown displaying the active user's name, role (👑 Master Admin, 🛡️ Admin, or 👤 Privilege Member), and Quick Sign Out action.
- **[`Nav.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/Nav.jsx) & [`Nav.css`](file:///d:/jewelry-ecommerce-main/client/src/components/Nav.css)**:
  - Secondary luxury menu bar showcasing primary jewellery categories: *Rings, Necklaces, Earrings, Bangles, Bracelets, Chains, Mangalsutra, Men's, Kids, Coins, Watches*.
  - Responsive hamburger drawer on mobile devices.
- **[`Footer.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/Footer.jsx) & [`Footer.css`](file:///d:/jewelry-ecommerce-main/client/src/components/Footer.css)**:
  - Luxury footer displaying concierge contact (+91 1800 233 8899), newsletter subscription form, official hallmark guarantee badge, social links, and legal navigation.
- **[`ProductCard.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/ProductCard.jsx) & [`ProductCard.css`](file:///d:/jewelry-ecommerce-main/client/src/components/ProductCard.css)**:
  - Reusable card used on Home and Category pages. Shows jewellery image, purity tag (`22K` / `18K`), star rating, formatted price (`₹`), Quick Wishlist heart toggle, and *View Details* trigger.
- **[`ProductModal.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/ProductModal.jsx) & [`ProductModal.css`](file:///d:/jewelry-ecommerce-main/client/src/components/ProductModal.css)**:
  - High-end pop-up modal when a customer clicks a product.
  - Includes interactive image gallery, 100% BIS Hallmark certificate verification box, certified bill splitup calculator (Metal cost vs. Atelier crafting charges), customer review system, and *Add to Cart* action.
- **[`GoldRateGraph.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/GoldRateGraph.jsx) & [`GoldRateGraph.css`](file:///d:/jewelry-ecommerce-main/client/src/components/GoldRateGraph.css)**:
  - Real-time interactive chart tracking 24K and 22K gold market trends over 7-day, 1-month, and 1-year intervals using SVG canvas.
- **[`IntroStamp.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/IntroStamp.jsx) & [`IntroStamp.css`](file:///d:/jewelry-ecommerce-main/client/src/components/IntroStamp.css)**:
  - Visual gold wax seal / animated seal displayed during site loading or celebratory milestone purchases.
- **[`EmailReportModal.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/EmailReportModal.jsx) & [`EmailReportModal.css`](file:///d:/jewelry-ecommerce-main/client/src/components/EmailReportModal.css)**:
  - Administrative and customer modal for dispatching official tax invoices, inventory summaries, and business intelligence reports directly via EmailJS with full dark mode color preservation.

---

### 3. Application Pages (`client/src/pages/`)

- **[`Home.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/Home.jsx) & [`Home.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/Home.css)**:
  - Landing showcase: Hero video/banner slider, curated Haute Joaillerie collections, trending ornaments, brand trust stamps, and customer testimonials.
- **[`ProductList.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/ProductList.jsx) & [`ProductList.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/ProductList.css)**:
  - Category showcase (e.g. `/category/ring`). Features faceted sidebar filters (Price range slider, Purity 18K/22K, Metal weight, In-stock filter) and sort controls.
- **[`Cart.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/Cart.jsx) & [`Cart.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/Cart.css)**:
  - Cart item management, coupon discounts (`ROYAL10`, `JEWELSTREET`), delivery address capture with Indian pincode validation, live gold break-up, and Razorpay checkout integration with authoritative backend payment verification.
- **[`Login.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/Login.jsx) & [`Login.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/Login.css)**:
  - Unified authentication page: Sign In, Sign Up, and Forgot Password (with 6-digit OTP verification).
  - Dedicated **"👑 Admin Sign In →"** portal redirection button.
  - Strict security guard: Denies admin emails on customer portal and redirects to `/admin`, while ensuring regular customers redirect smoothly to `/profile`.
  - Google OAuth / Direct Account login modal with geolocation detection.
- **[`Profile.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/Profile.jsx) & [`Profile.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/Profile.css)**:
  - Customer account management: Personal details, shipping address, order history with live status tracker, downloadable PDF invoice generation, and 7-day Return/Replacement ticket submission.
- **[`AdminDashboard.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/AdminDashboard.jsx) & [`AdminDashboard.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/AdminDashboard.css)**:
  - Complete Enterprise Administrative Suite with 6 tabs:
    1. **Overview**: Key metrics (Gross revenue, total orders, average order value, conversion rate), sales trend charts, quick report generator.
    2. **Orders**: Full order management with status filters (Pending, Processing, Shipped, Delivered, Cancelled), tracking number updates, print invoice, and email resend.
    3. **Inventory & Products**: Add new jewellery, edit price/stock, delete items, low-stock alerts.
    4. **Customers Directory**: Complete customer directory with lifetime order count and total spend in ₹.
    5. **Problem Solver (Support Helpdesk)**: Customer query ticketing system with Priority (High, Medium, Low) and resolution notes.
    6. **Admin Management**: Sub-admin directory and password manager. Master Admin exclusive tab.
    7. **Coupons**: Discount code creator and active offer toggles.
- **[`Favourites.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/Favourites.jsx) & [`Favourites.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/Favourites.css)**:
  - Customer Wishlist / Saved items gallery with 1-click *Move to Bag*.
- **[`LiveGoldRates.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/LiveGoldRates.jsx) & [`LiveGoldRates.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/LiveGoldRates.css)**:
  - Dedicated page for real-time 24K and 22K gold rate monitoring across major Indian cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata).
- **[`StaticPages.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/StaticPages.jsx) & [`StaticPage.css`](file:///d:/jewelry-ecommerce-main/client/src/pages/StaticPage.css)**:
  - Houses statutory, informational, and luxury policy pages (About Us, Hallmark Certification, Privacy Policy, Terms of Service, Store Locator, Affiliate & Collaborations).

---

### 4. Global State & Services (`client/src/context/` & `client/src/services/`)

- **[`AuthContext.jsx`](file:///d:/jewelry-ecommerce-main/client/src/context/AuthContext.jsx)**: Manages authentication state, user session storage (`localStorage`), token headers for Axios, and login/logout handlers.
- **[`CartContext.jsx`](file:///d:/jewelry-ecommerce-main/client/src/context/CartContext.jsx)**: Manages shopping bag items, quantity increments/decrements, item removal, and subtotal calculation.
- **[`FavouritesContext.jsx`](file:///d:/jewelry-ecommerce-main/client/src/context/FavouritesContext.jsx)**: Manages Wishlist state with localStorage persistence and API sync.
- **[`emailjsService.js`](file:///d:/jewelry-ecommerce-main/client/src/services/emailjsService.js)**:
  - Dispatches purchase tax invoices and analytics reports via EmailJS (`@emailjs/browser`).
  - Embeds Cloudflare CDN logo (`https://iili.io/n3SbdKb.png`) and royal dark blue (`#090029` / `#0d0038`) styling with CSS gradient shields preventing Dark Mode inversions in Gmail.
- **[`reportExporter.js`](file:///d:/jewelry-ecommerce-main/client/src/services/reportExporter.js)**:
  - Client-side document generator for PDF tax invoices, CSV exports, Excel spreadsheets (`.xlsx`), and thermal printable receipts.

---

## ⚙️ Backend Application (`server/`)

### 1. Server Core & Configuration
- **[`server/index.js`](file:///d:/jewelry-ecommerce-main/server/index.js)**: Main server entry point. Sets up Express, CORS headers, JSON body parsers, connects to MongoDB via `connectDB()`, mounts API routes, and binds to `process.env.PORT` (5000).
- **[`server/.env`](file:///d:/jewelry-ecommerce-main/server/.env)**: Environment configuration file holding database connection strings, JWT secrets, Razorpay keys, EmailJS keys, and Master Admin emails.
- **[`server/config/db.js`](file:///d:/jewelry-ecommerce-main/server/config/db.js)**:
  - Manages Mongoose connection to MongoDB Atlas with Google & Cloudflare DNS fallbacks (`8.8.8.8`, `1.1.1.1`).
  - Automatically seeds default products, initial master admin, and synchronizes any pending offline data files into Atlas on startup.

---

### 2. Database Models (`server/models/`)
Mongoose schemas defining the MongoDB document structures:
- **[`User.js`](file:///d:/jewelry-ecommerce-main/server/models/User.js)**: Customer account data (name, email, hashed password, phone, address, pincode, role: `customer` or `admin`, registration timestamp).
- **[`Admin.js`](file:///d:/jewelry-ecommerce-main/server/models/Admin.js)**: Administrator credentials (adminId, name, email, password, role: `master_admin` or `admin`, mustChangePassword flag).
- **[`Product.js`](file:///d:/jewelry-ecommerce-main/server/models/Product.js)**: Jewellery catalog document (productId, name, category, purity, weight, price, image, stock, rating, reviews array).
- **[`Order.js`](file:///d:/jewelry-ecommerce-main/server/models/Order.js)**: Verified order record (invoiceNo, customerName, customerEmail, deliveryAddress, pincode, items array, totalAmount, paymentStatus: `Paid`/`Failed`, paymentId, razorpaySignature, trackingNumber).
- **[`Cart.js`](file:///d:/jewelry-ecommerce-main/server/models/Cart.js)**: User-specific cart storage linked to MongoDB userId.
- **[`Favourites.js`](file:///d:/jewelry-ecommerce-main/server/models/Favourites.js)**: Wishlist items linked to user email.
- **[`Coupon.js`](file:///d:/jewelry-ecommerce-main/server/models/Coupon.js)**: Promotional vouchers (code, discountPercent, maxDiscount, minOrder, validUntil, isActive).
- **[`CustomerQuery.js`](file:///d:/jewelry-ecommerce-main/server/models/CustomerQuery.js)**: Problem Solver helpdesk ticket (ticketId, customerName, customerEmail, subject, message, priority, status: `Pending`/`In Progress`/`Resolved`, resolutionNotes).

---

### 3. REST API Routes (`server/routes/`)
- **[`auth.js`](file:///d:/jewelry-ecommerce-main/server/routes/auth.js)**:
  - `POST /api/auth/register` — Creates customer account.
  - `POST /api/auth/login` — Verifies password, enforces portal routing (denies admins on customer login).
  - `POST /api/auth/google-direct` — Direct Google authentication.
  - `POST /api/auth/forgot-password` & `verify-otp` — Password reset flow with 6-digit OTP.
  - `GET /api/auth/customers` — Returns aggregated customers directory for Admin Dashboard.
  - `GET /api/auth/admins` & `POST /api/auth/admins/create` — Sub-admin management (Master Admin exclusive).
- **[`products.js`](file:///d:/jewelry-ecommerce-main/server/routes/products.js)**:
  - `GET /api/products` — Fetches full catalog or filter by category.
  - `POST /api/products` & `PUT /api/products/:id` — Admin product creation and stock update.
  - `DELETE /api/products/:id` — Removes product from catalog.
- **[`orders.js`](file:///d:/jewelry-ecommerce-main/server/routes/orders.js)**:
  - `GET /api/orders` — Admin lists all orders with status filtering.
  - `GET /api/orders/user/:email` — Fetches individual customer order history.
  - `PUT /api/orders/:id/status` — Updates order tracking and shipping stages.
- **[`payment.js`](file:///d:/jewelry-ecommerce-main/server/routes/payment.js)**:
  - `POST /api/payment/create-order` — Creates Razorpay order.
  - `POST /api/payment/verify-and-place-order` — Authoritative backend HMAC-SHA256 signature verification. Triggers purchase tax invoice email upon success.
  - `POST /api/payment/record-failed-payment` — Logs payment drops and card declines.
- **[`support.js`](file:///d:/jewelry-ecommerce-main/server/routes/support.js)**:
  - Problem Solver ticket endpoints: `GET /api/support/tickets`, `POST /api/support/tickets/create`, `PUT /api/support/tickets/:id/resolve`.
- **[`coupons.js`](file:///d:/jewelry-ecommerce-main/server/routes/coupons.js)**:
  - Promo code validation for cart checkout and admin voucher configuration.
- **[`cart.js`](file:///d:/jewelry-ecommerce-main/server/routes/cart.js)** & **[`favourites.js`](file:///d:/jewelry-ecommerce-main/server/routes/favourites.js)**:
  - Server-side bag and wishlist synchronization.

---

### 4. Middleware & Services (`server/middleware/` & `server/services/`)
- **[`authMiddleware.js`](file:///d:/jewelry-ecommerce-main/server/middleware/authMiddleware.js)**:
  - `protect`: Verifies JWT bearer token.
  - `adminOnly`: Restricts privileged routes strictly to authorized administrators (`MASTER_ADMIN_EMAILS` or `role === 'admin'`).
- **[`emailService.js`](file:///d:/jewelry-ecommerce-main/server/services/emailService.js)**:
  - Primary email delivery service using EmailJS REST API and Nodemailer fallback.
  - Generates official tax invoices, 7-day return request confirmations, and cancellation/refund notices.
  - Formatted in royal dark blue with Cloudflare CDN logo and anti-inversion dark mode styling.

---

### 5. Local Redundancy Data Files (`server/data/`)
JSON files that provide local persistence when MongoDB is starting or running offline:
- **`products.json`**: Initial catalogue of rings, necklaces, earrings, bangles, etc.
- **`orders.json`**: Local disk backup of customer purchases.
- **`admins.json`**: Registered administrator profiles.
- **`coupons.json`**: Promo code configurations.
- **`support_tickets.json`**: Customer queries.
- **`daily_gold_rate.json`**: Historical gold price records.

---

## 📑 Quick Reference Summary

| Need to change... | File to edit |
| :--- | :--- |
| **Site Theme, Colors, Fonts** | [`client/src/index.css`](file:///d:/jewelry-ecommerce-main/client/src/index.css) |
| **Header, Search Bar, Brand Logo** | [`client/src/components/Header.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/Header.jsx) |
| **Navigation Links or Categories** | [`client/src/components/Nav.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/Nav.jsx) |
| **Product Modal & Bill Splitup** | [`client/src/components/ProductModal.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/ProductModal.jsx) |
| **Cart & Razorpay Checkout** | [`client/src/pages/Cart.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/Cart.jsx) |
| **Customer & Admin Login Rules** | [`client/src/pages/Login.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/Login.jsx) & [`server/routes/auth.js`](file:///d:/jewelry-ecommerce-main/server/routes/auth.js) |
| **Admin Dashboard Tabs & Metrics** | [`client/src/pages/AdminDashboard.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/AdminDashboard.jsx) |
| **Email Invoice Layout & Styling** | [`client/src/services/emailjsService.js`](file:///d:/jewelry-ecommerce-main/client/src/services/emailjsService.js) & [`server/services/emailService.js`](file:///d:/jewelry-ecommerce-main/server/services/emailService.js) |
| **Database Schema / Data Models** | [`server/models/`](file:///d:/jewelry-ecommerce-main/server/models/) |
| **API Endpoints & Server Logic** | [`server/routes/`](file:///d:/jewelry-ecommerce-main/server/routes/) |
| **MongoDB Atlas Connection & Keys** | [`server/.env`](file:///d:/jewelry-ecommerce-main/server/.env) & [`DATABASE_AND_CONFIGURATION_GUIDE.md`](file:///d:/jewelry-ecommerce-main/DATABASE_AND_CONFIGURATION_GUIDE.md) |
