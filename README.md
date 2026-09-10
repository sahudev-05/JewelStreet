# 👑 Jewel Street — Haute Joaillerie & Luxury Fine Jewellery

<div align="center">
  <img src="https://iili.io/n3SbdKb.png" alt="Jewel Street Royal Crest" width="120" style="border-radius: 50%; border: 3px solid #e6b97e; background: #090029; padding: 6px;" />
  <br/>
  <h2>JEWEL STREET</h2>
  <p><strong>Official Certified 100% BIS Hallmarked Fine Jewellery E-Commerce Platform</strong></p>
  <p>
    <a href="#-project-overview">Overview</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-application-structure">Architecture</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-database--models">Database</a> •
    <a href="#-admin-security--portals">Security</a>
  </p>
</div>

---

## 🌟 Project Overview

**Jewel Street** is an enterprise-grade luxury e-commerce web platform engineered specifically for Haute Joaillerie (fine gold, diamond, and gemstone jewellery). Designed with a bespoke royal dark blue palette (`#090029`, `#0d0038`) and champagne gold accents (`#e6b97e`), the application delivers a royal concierge experience across both customer storefront and executive administrative operations.

### Key Highlights:
- **Certified Bill Splitup**: Transparent break-up of gross metal value, atelier making charges (18%), and central/state GST as per Indian statutory guidelines.
- **Authoritative Backend Payment Verification**: Cryptographic HMAC-SHA256 signature validation on server preventing unverified order placement.
- **Live Gold Rates & Interactive Charts**: Live 24K and 22K multi-city gold prices with canvas trend analytics.
- **Enterprise Admin Suite**: Multi-tab dashboard for order dispatch, inventory control, customer relationship directory, customer support helpdesk (*Problem Solver*), and multi-tiered admin management.
- **Dark-Mode Hardened Transactional Emails**: Purchase tax invoices and business reports dispatched via EmailJS using Cloudflare CDN assets and CSS gradient shields preventing email client color inversions.
- **Strict Portal Segregation**: Distinct customer and admin authentication pathways preventing cross-portal privilege leakage.

---

## 💎 Key Features

### 🛍️ Luxury Customer Storefront
- **Brand Showcase**: Hero carousel, curated collections (*Royal Solitaires, Heritage Bridal, Contemporary Atelier, Men's Royal Cadre*), trust hallmarks, and customer reviews.
- **Faceted Product Discovery**: Instant autocomplete search, multi-category navigation (Rings, Necklaces, Earrings, Bangles, Bracelets, Chains, Mangalsutra, Men's, Kids, Coins, Watches), price filters, purity toggles (18K, 22K, 24K), and weight sliders.
- **Interactive Product Modal**: High-resolution gallery, BIS hallmark verification seal, live metal vs. crafting price break-up, and customer review system.
- **Wishlist & Shopping Bag**: Persistent localStorage wishlist and shopping cart with real-time price calculations and coupon discounts (`ROYAL10`, `JEWELSTREET`).
- **Live Gold Rates**: Interactive price monitoring chart for 24K & 22K gold across Mumbai, Delhi, Bangalore, Chennai, and Kolkata.

### 💳 Checkout & Authoritative Payment Verification
- **Delivery Address & Pincode Validation**: Multi-step delivery capture with Indian pincode verification.
- **Secured Payment Gateway**: Integrated with Razorpay with test-mode fallback.
- **Cryptographic Backend Verification**: Client submits payment identifiers (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) to `/api/payment/verify-and-place-order`. Backend re-computes HMAC-SHA256 using `RAZORPAY_KEY_SECRET` before marking orders as paid.
- **Failure Audit Logging**: Failed transactions and user drops are logged in `/api/payment/record-failed-payment` for executive review.

### 👤 Customer Profile & Orders
- **Customer Dashboard**: Displays account overview, delivery address book, and order history.
- **Interactive Order Tracking**: Visual progress pipeline (*Pending ➔ Processing ➔ Shipped ➔ Delivered*).
- **Downloadable Tax Invoice**: 1-click printable and PDF tax invoice generation.
- **7-Day Return / Replacement Tickets**: Built-in statutory replacement and return request system.

### 👑 Executive Administrative Dashboard (`/admin`)
- **Overview & Analytics**: Live revenue counters, total order count, average order value, conversion rates, and sales trend graphs.
- **Orders Management**: Filter orders by status (*Pending, Processing, Shipped, Delivered, Cancelled*), update tracking numbers, generate invoices, and resend customer receipts.
- **Inventory & Catalog Control**: Add new ornaments, edit price, stock count, weight, and purity, upload images, and view low-stock alerts.
- **Customers Directory**: Complete customer directory displaying avatar, contact info, total orders placed, and lifetime spend in Indian Rupees (`₹`).
- **Problem Solver (Support Helpdesk)**: Customer query ticketing system with priority badges (*High, Medium, Low*), status filters, and admin resolution logs.
- **Admin Management (Master Admin Exclusive)**: Create sub-administrators, reset admin passwords, and inspect team roles.
- **Offers & Coupons**: Create discount vouchers, set validity dates, and toggle active promos.

### 📬 Transactional Email System
- Automated delivery of Purchase Tax Invoices, Administrator Credentials, Return Confirmations, and Refund Notices.
- Dual delivery engine: Client browser EmailJS integration + backend REST fallback.
- Cloudflare CDN high-speed logo embedding (`https://iili.io/n3SbdKb.png`).
- Email dark-mode protection with `background-image: linear-gradient(...)` and `-webkit-text-fill-color` shields preventing Gmail/Outlook color inversion.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (SPA)
- **Build Tool**: Vite 8.2
- **Routing**: React Router DOM (`react-router-dom` v6)
- **Styling**: Vanilla Luxury CSS with CSS Custom Properties, Glassmorphism, and responsive media queries
- **State Management**: React Context API (`AuthContext`, `CartContext`, `FavouritesContext`)
- **Icons & Fonts**: Font Awesome 6, Google Fonts (Cinzel, Playfair Display, Montserrat, Georgia)
- **External Services**: `@emailjs/browser`, Axios, Canvas/SVG Charts, SheetJS (XLSX), HTML2PDF

### Backend
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose ODM (with local JSON file redundancy)
- **Authentication**: JWT (JSON Web Tokens) with Bearer token authentication & bcrypt password hashing
- **Payment Verification**: Razorpay SDK + Node.js native `crypto` (HMAC-SHA256)
- **Email Engine**: `@emailjs/nodejs` & REST API with Nodemailer fallback
- **DNS Handling**: Native Node.js DNS resolver with Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) fallbacks for Atlas SRV resolution on Windows

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas connection string (or local MongoDB running on `mongodb://localhost:27017`)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/jewelry-ecommerce.git
cd jewelry-ecommerce

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Edit [`server/.env`](file:///d:/jewelry-ecommerce-main/server/.env):
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.e32jvv6.mongodb.net/jewelstreet?retryWrites=true&w=majority

# Server Port & JWT Secret
PORT=5000
JWT_SECRET=jewelstreet_super_secret_key_2025

# Razorpay Keys (https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# EmailJS Service Configuration (https://dashboard.emailjs.com)
EMAILJS_SERVICE_ID=service_qwc2v11
EMAILJS_TEMPLATE_ID=template_kiv2ph2
EMAILJS_PUBLIC_KEY=f7Xq2k5J4HeAmh5H3
EMAILJS_PRIVATE_KEY=WFftm7MxAkMotDVLX51u-

# Master Administrators (comma-separated exact emails)
MASTER_ADMIN_EMAILS=deevyanshu.sahu@gmail.com,deevyanshusahu@gmail.com,admin@jewelstreet.com
```

### 3. Launch Development Servers

Run both servers concurrently in separate terminals:

**Terminal 1 (Backend API)**:
```bash
cd server
npm run dev
```
*API runs at `http://localhost:5000`*

**Terminal 2 (Frontend Storefront)**:
```bash
cd client
npm run dev
```
*Vite client runs at `http://localhost:5173`*

---

## 📂 Application Architecture

```
jewelry-ecommerce-main/
├── client/                                 # Frontend React Application
│   ├── public/                             # Public static assets
│   │   ├── logo.png                        # Official brand logo
│   │   └── photos/                         # Catalog photography
│   ├── src/
│   │   ├── components/                     # Reusable Luxury Components
│   │   │   ├── Header.jsx / .css           # Top bar, search, wishlist/cart icons, user menu
│   │   │   ├── Nav.jsx / .css              # Category navigation drawer
│   │   │   ├── Footer.jsx / .css           # Concierge info, newsletter, legal links
│   │   │   ├── ProductCard.jsx / .css      # Ornament preview card with purity badge
│   │   │   ├── ProductModal.jsx / .css     # Detailed product view & certified bill splitup
│   │   │   ├── GoldRateGraph.jsx / .css    # Real-time gold price canvas chart
│   │   │   ├── IntroStamp.jsx / .css       # Animated gold wax seal stamp
│   │   │   └── EmailReportModal.jsx / .css # Transactional email report dispatcher
│   │   ├── context/                        # Global State Providers
│   │   │   ├── AuthContext.jsx             # User login session & JWT storage
│   │   │   ├── CartContext.jsx             # Shopping bag items & total calculations
│   │   │   └── FavouritesContext.jsx       # Wishlist items & sync
│   │   ├── pages/                          # Primary Views & Screens
│   │   │   ├── Home.jsx / .css             # Landing page & curated collections
│   │   │   ├── ProductList.jsx / .css      # Category listings & faceted filter sidebar
│   │   │   ├── Cart.jsx / .css             # Checkout, coupons & Razorpay integration
│   │   │   ├── Login.jsx / .css            # Customer & Admin login with OTP reset
│   │   │   ├── Profile.jsx / .css          # Customer account, orders & return tickets
│   │   │   ├── AdminDashboard.jsx / .css   # 7-tab Executive Admin Dashboard
│   │   │   ├── Favourites.jsx / .css       # Customer Wishlist gallery
│   │   │   ├── LiveGoldRates.jsx / .css    # Multi-city 24K/22K gold tracker
│   │   │   └── StaticPages.jsx / .css      # Hallmark, About, Privacy, Terms, Locator
│   │   ├── services/                       # Client Services & Utilities
│   │   │   ├── emailjsService.js           # Client EmailJS dispatcher (anti-dark-mode)
│   │   │   └── reportExporter.js           # PDF, Excel, CSV & Receipt document generator
│   │   ├── App.jsx                         # Main Router & Provider tree
│   │   ├── index.css                       # Global design system tokens & typography
│   │   └── main.jsx                        # React 18 DOM mount point
│   ├── index.html                          # HTML template shell
│   └── vite.config.js                      # Vite config & API reverse proxy
│
├── server/                                 # Backend REST API Application
│   ├── config/
│   │   └── db.js                           # MongoDB Atlas connection, DNS & auto-seed
│   ├── data/                               # Local Redundancy & Seeding JSON
│   │   ├── products.json                   # Product catalog backup
│   │   ├── orders.json                     # Orders backup
│   │   ├── admins.json                     # Authorized admin records
│   │   ├── coupons.json                    # Voucher definitions
│   │   ├── support_tickets.json            # Support ticket records
│   │   └── daily_gold_rate.json            # Historical gold rates
│   ├── middleware/
│   │   └── authMiddleware.js               # JWT verification & adminOnly guard
│   ├── models/                             # Mongoose Database Models
│   │   ├── User.js                         # Customer account schema
│   │   ├── Admin.js                        # Administrator credentials schema
│   │   ├── Product.js                      # Jewellery catalog schema
│   │   ├── Order.js                        # Purchase tax invoice schema
│   │   ├── CustomerQuery.js                # Problem solver ticket schema
│   │   ├── Coupon.js                       # Promo voucher schema
│   │   ├── Cart.js                         # User cart schema
│   │   └── Favourites.js                   # User wishlist schema
│   ├── routes/                             # Express REST API Endpoints
│   │   ├── auth.js                         # Auth, Google, OTP reset, customers & admins
│   │   ├── products.js                     # Catalog CRUD & stock management
│   │   ├── orders.js                       # Order history & status dispatch
│   │   ├── payment.js                      # Razorpay order create & HMAC verification
│   │   ├── support.js                      # Problem solver helpdesk endpoints
│   │   ├── coupons.js                      # Voucher validation & admin toggle
│   │   ├── cart.js                         # Server-side cart sync
│   │   └── favourites.js                   # Server-side wishlist sync
│   ├── services/
│   │   └── emailService.js                 # Transactional EmailJS & Nodemailer engine
│   ├── .env                                # Secrets & credentials
│   ├── index.js                            # Express server initialization
│   └── package.json                        # Backend dependencies
│
├── CODEBASE_GUIDE.md                       # Comprehensive file-by-file guide
├── DATABASE_AND_CONFIGURATION_GUIDE.md     # MongoDB Atlas & system config guide
└── README.md                               # (This File) Official Project Documentation
```

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | Public |
| `POST` | `/api/auth/login` | Authenticate customer/admin with portal check | Public |
| `POST` | `/api/auth/google-direct` | Google OAuth direct authentication | Public |
| `POST` | `/api/auth/forgot-password` | Request 6-digit OTP for password reset | Public |
| `POST` | `/api/auth/verify-otp` | Verify OTP and reset password | Public |
| `GET` | `/api/auth/customers` | Get directory of all customers with order metrics | Admin Only |
| `GET` | `/api/auth/admins` | List registered administrators | Master Admin |
| `POST` | `/api/auth/admins/create` | Create new administrator account | Master Admin |

### Products (`/api/products`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Fetch all products (optional `?category=`) | Public |
| `GET` | `/api/products/:id` | Fetch single product details | Public |
| `POST` | `/api/products` | Add new jewellery piece to catalog | Admin Only |
| `PUT` | `/api/products/:id` | Update product details or stock | Admin Only |
| `DELETE` | `/api/products/:id` | Remove product from catalog | Admin Only |

### Payments & Orders (`/api/payment` & `/api/orders`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payment/create-order` | Create Razorpay order | Authenticated |
| `POST` | `/api/payment/verify-and-place-order` | Verify HMAC-SHA256 signature & create invoice | Authenticated |
| `POST` | `/api/payment/record-failed-payment` | Log payment decline or abandonment | Authenticated |
| `GET` | `/api/orders` | List all orders with status filters | Admin Only |
| `GET` | `/api/orders/user/:email` | Get customer order history | Authenticated |
| `PUT` | `/api/orders/:id/status` | Update shipping status & tracking number | Admin Only |

### Problem Solver Helpdesk (`/api/support`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/support/tickets` | List customer queries with status/priority filter | Admin Only |
| `POST` | `/api/support/tickets/create` | Submit customer support inquiry | Public |
| `PUT` | `/api/support/tickets/:id/resolve` | Update status (`Resolved`) & write notes | Admin Only |

### Coupons (`/api/coupons`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/coupons` | List all coupons | Public |
| `POST` | `/api/coupons/validate` | Validate coupon code for checkout | Public |
| `POST` | `/api/coupons` | Create new promotional voucher | Master Admin |
| `PATCH`| `/api/coupons/:id/toggle` | Activate/deactivate promo voucher | Master Admin |

---

## 🗄️ Database & Models

Jewel Street connects to MongoDB Atlas using Mongoose ODM:

- **`User`**: Full customer profiles (`name`, `email`, `password`, `phone`, `address`, `pincode`, `role: 'customer' | 'admin'`).
- **`Admin`**: Administrative credentials (`adminId`, `name`, `email`, `password`, `role: 'master_admin' | 'admin'`).
- **`Product`**: Jewellery items (`productId`, `name`, `category`, `purity`, `weight`, `price`, `image`, `stock`, `rating`, `reviews`).
- **`Order`**: Tax invoices (`invoiceNo`, `customerName`, `customerEmail`, `deliveryAddress`, `items`, `totalAmount`, `paymentStatus`, `paymentId`, `signatureVerified: true`).
- **`CustomerQuery`**: Helpdesk tickets (`ticketId`, `customerName`, `customerEmail`, `subject`, `category`, `priority`, `status`, `resolutionNotes`).
- **`Coupon`**: Promo codes (`code`, `discountPercent`, `maxDiscount`, `minOrder`, `isActive`).

> For complete instructions on connecting MongoDB Compass, creating schema migrations, and managing Atlas clusters, refer to **[`DATABASE_AND_CONFIGURATION_GUIDE.md`](file:///d:/jewelry-ecommerce-main/DATABASE_AND_CONFIGURATION_GUIDE.md)**.

---

## 🔐 Security & Administration

1. **Strict Exact Email Authorization**:
   - Substring matching has been eliminated across all authentication layers.
   - Master Administrators are strictly defined by exact match in `server/.env` (`MASTER_ADMIN_EMAILS`) and `server/data/admins.json`.
   - Normal customer accounts (including variants like `deevyanshusahu05@gmail.com` or `deevyanshusahu@bcah.christuniversity.in`) are recognized as customers and routed directly to `/profile`.

2. **Portal Segregation**:
   - Administrator accounts cannot sign in through the customer login modal. Attempting to do so triggers an informative `403 Forbidden` response and redirects the user to `/admin`.
   - Customer accounts logging into `/admin` are denied access.

3. **Cryptographic Payment Integrity**:
   - Orders are never marked as "Paid" from the frontend. The backend verifies the Razorpay signature using the server secret key before persisting the order.

4. **Sub-Administrator Restrictions**:
   - Personnel creation, administrator password overrides, and voucher deletion are strictly restricted to Master Admin (`isMaster === true`). Sub-administrators see a view-only team directory.

---

## 📄 Documentation Sitemap

- 📘 **[`README.md`](file:///d:/jewelry-ecommerce-main/README.md)**: (This File) Flagship project overview, features, quick start, and architecture.
- 🏛️ **[`CODEBASE_GUIDE.md`](file:///d:/jewelry-ecommerce-main/CODEBASE_GUIDE.md)**: Detailed file-by-file walkthrough covering every component, page, service, and route.
- 🗄️ **[`DATABASE_AND_CONFIGURATION_GUIDE.md`](file:///d:/jewelry-ecommerce-main/DATABASE_AND_CONFIGURATION_GUIDE.md)**: Complete guide for MongoDB Atlas, Mongoose schemas, Compass GUI, and `.env` setup.

---

<div align="center">
  <sub>👑 © 2026 Jewel Street Haute Joaillerie. All Ornaments Certified 100% BIS Hallmarked.</sub>
</div>
