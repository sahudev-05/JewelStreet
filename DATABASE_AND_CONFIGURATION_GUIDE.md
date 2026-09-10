# 🗄️ Jewel Street — Database, MongoDB & Configuration Guide

This guide explains how data is structured, stored, and managed in **Jewel Street**, and gives step-by-step instructions on how to make changes to MongoDB Atlas, local databases, data models, and environment settings.

---

## 1. 🌐 How MongoDB is Configured in Jewel Street

Jewel Street uses **Mongoose** (an Object Data Modeling library for Node.js) to interact with MongoDB.

### The Connection String Location
All database settings reside in:
👉 **[`server/.env`](file:///d:/jewelry-ecommerce-main/server/.env)**

Look for the line:
```env
# server/.env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/jewelstreet?retryWrites=true&w=majority
```

Currently configured:
```env
MONGODB_URI=mongodb+srv://deevyanshusahu_db_user:mTr9kAwrvjtK9UPD@cluster0.e32jvv6.mongodb.net/jewelstreet?retryWrites=true&w=majority
```

### Connection Implementation
The database connection logic is defined in **[`server/config/db.js`](file:///d:/jewelry-ecommerce-main/server/config/db.js)**.
- **Custom DNS Resolution**: Automatically resolves Atlas SRV records using Google DNS (`8.8.8.8`) and Cloudflare (`1.1.1.1`) to prevent Windows DNS refusal errors.
- **Auto-Reconnect**: Automatically reconnects if a network interruption occurs.
- **Automatic Seeding & Sync**: When the server boots, `db.js` checks if products, master admin, orders, and support queries exist; if not, it automatically seeds them from local data files into your MongoDB Atlas cluster.
- **Offline Fallback**: If MongoDB is unreachable, the server falls back to local JSON files in `server/data/` so the site never crashes.

---

## 2. 📂 Database Collections & Data Models

Inside your MongoDB `jewelstreet` database, there are **8 primary collections**:

| Collection Name | Mongoose Model File | Description |
| :--- | :--- | :--- |
| **`users`** | [`server/models/User.js`](file:///d:/jewelry-ecommerce-main/server/models/User.js) | Customer account profiles, passwords, contact info, and role (`customer` / `admin`). |
| **`admins`** | [`server/models/Admin.js`](file:///d:/jewelry-ecommerce-main/server/models/Admin.js) | Administrator accounts, password hashes, and designation (`master_admin` / `admin`). |
| **`products`** | [`server/models/Product.js`](file:///d:/jewelry-ecommerce-main/server/models/Product.js) | Jewellery catalog with categories, 22K/18K purity, weight, prices, stock, and customer reviews. |
| **`orders`** | [`server/models/Order.js`](file:///d:/jewelry-ecommerce-main/server/models/Order.js) | Authoritative purchase records, tax invoices, Razorpay signatures, and delivery statuses. |
| **`customerqueries`** | [`server/models/CustomerQuery.js`](file:///d:/jewelry-ecommerce-main/server/models/CustomerQuery.js) | Problem Solver support tickets, priority levels, and admin resolution notes. |
| **`coupons`** | [`server/models/Coupon.js`](file:///d:/jewelry-ecommerce-main/server/models/Coupon.js) | Promo vouchers, discount percentages, validity dates, and active flags. |
| **`carts`** | [`server/models/Cart.js`](file:///d:/jewelry-ecommerce-main/server/models/Cart.js) | Active shopping cart items linked to user accounts. |
| **`favourites`** | [`server/models/Favourites.js`](file:///d:/jewelry-ecommerce-main/server/models/Favourites.js) | Saved customer wishlist ornaments. |

---

## 3. 🛠️ How to Make Changes to MongoDB

### Task A: Switching to a New MongoDB Atlas Cluster
1. Log into [MongoDB Cloud](https://cloud.mongodb.com/).
2. Create or select your cluster and click **"Connect"** ➔ **"Drivers"** (Node.js).
3. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@mycluster.mongodb.net/?retryWrites=true&w=majority
   ```
4. Open [`server/.env`](file:///d:/jewelry-ecommerce-main/server/.env) and update `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@mycluster.mongodb.net/jewelstreet?retryWrites=true&w=majority
   ```
   *(Make sure to replace `<username>` and `<password>` with your database user credentials, and add `/jewelstreet` before the `?`)*.
5. In your MongoDB Atlas dashboard under **Network Access**, ensure IP `0.0.0.0/0` (Allow Access from Anywhere) is added so your server can connect.
6. Restart the backend server. The server will automatically connect and seed initial products and collections.

---

### Task B: Switching to Local MongoDB (Offline)
If you have MongoDB Community Server installed on your computer:
1. Open [`server/.env`](file:///d:/jewelry-ecommerce-main/server/.env).
2. Change `MONGODB_URI` to:
   ```env
   MONGODB_URI=mongodb://localhost:27017/jewelstreet
   ```
3. Save the file and restart the backend (`npm run dev` in `server/`).

---

### Task C: Adding or Modifying Fields in a Collection (Schema Updates)
If you want to add new fields (for example, adding `diamondCarat` to Products):

1. **Update the Mongoose Model**:
   Open the respective model file in **`server/models/`** (e.g., [`server/models/Product.js`](file:///d:/jewelry-ecommerce-main/server/models/Product.js)).
   Add your new field:
   ```javascript
   const productSchema = new mongoose.Schema({
     name: { type: String, required: true },
     category: { type: String, required: true },
     purity: { type: String, default: '22K' },
     // 👉 Your new field here:
     diamondCarat: { type: Number, default: 0 },
     // ...
   });
   ```
2. **Update the Route Handler**:
   If this field needs to be created or edited via API, update **[`server/routes/products.js`](file:///d:/jewelry-ecommerce-main/server/routes/products.js)** in the `POST /` and `PUT /:id` route handlers to accept `req.body.diamondCarat`.
3. **Update the Frontend UI**:
   Update the form in [`client/src/pages/AdminDashboard.jsx`](file:///d:/jewelry-ecommerce-main/client/src/pages/AdminDashboard.jsx) or modal in [`client/src/components/ProductModal.jsx`](file:///d:/jewelry-ecommerce-main/client/src/components/ProductModal.jsx) to display or edit this field.

---

### Task D: Viewing & Editing Database Data Directly (GUI)
You can visually inspect and edit your MongoDB data in two ways:

#### Method 1: MongoDB Compass (Free Desktop GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/tools/compass).
2. Launch Compass and paste your `MONGODB_URI` from `server/.env`.
3. Click **Connect**.
4. You will see the `jewelstreet` database with all 8 collections. You can directly edit documents, delete test orders, or add products.

#### Method 2: MongoDB Atlas Web Console
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com/).
2. Navigate to **Database** ➔ click your Cluster ➔ click **"Browse Collections"**.
3. Select `jewelstreet` ➔ browse any collection (`users`, `orders`, `products`).
4. Click **Insert Document** or click the pencil icon on any document to edit fields.

---

### Task E: How to Add More Master Administrators
Master Admins have full system authority (can create sub-admins, reset admin passwords, and configure offers).

There are two ways to grant Master Admin status:
1. **Via `server/.env` (Instant & Recommended)**:
   Open [`server/.env`](file:///d:/jewelry-ecommerce-main/server/.env) and add the email to `MASTER_ADMIN_EMAILS` (comma-separated):
   ```env
   MASTER_ADMIN_EMAILS=deevyanshu.sahu@gmail.com,deevyanshusahu@gmail.com,admin@jewelstreet.com,your.new.email@example.com
   ```
2. **Via Database (`admins` collection)**:
   In MongoDB Atlas or Compass, find the document in `admins` collection and set:
   ```json
   {
     "email": "your.new.email@example.com",
     "role": "master_admin"
   }
   ```

---

### Task F: Resetting or Re-seeding Products and Data
If you want to reset your catalogue back to the original luxury items:
1. Connect to MongoDB (via Compass or Atlas).
2. Delete the documents in the `products` collection.
3. Edit [`server/data/products.json`](file:///d:/jewelry-ecommerce-main/server/data/products.json) with any custom products you want.
4. Restart your backend server (`npm run dev` in `server/`).
5. On startup, [`server/config/db.js`](file:///d:/jewelry-ecommerce-main/server/config/db.js) will detect 0 products and automatically seed everything from `products.json` into MongoDB.

---

## 4. 🔑 Other Important Configuration Variables (`server/.env`)

| Variable | Description | Where to Obtain |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas cluster connection string. | [cloud.mongodb.com](https://cloud.mongodb.com/) |
| `PORT` | Backend server port (Default: `5000`). | Set in `.env`. |
| `JWT_SECRET` | Secret string for cryptographic token signing. | Any secure 32+ character random string. |
| `RAZORPAY_KEY_ID` | Razorpay public payment API key. | [dashboard.razorpay.com](https://dashboard.razorpay.com/) ➔ Settings ➔ API Keys. |
| `RAZORPAY_KEY_SECRET` | Razorpay private secret key (used for HMAC verification). | [dashboard.razorpay.com](https://dashboard.razorpay.com/) ➔ Settings ➔ API Keys. |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID for Google login. | [console.cloud.google.com](https://console.cloud.google.com/) ➔ APIs & Services ➔ Credentials. |
| `EMAILJS_SERVICE_ID` | EmailJS Email Service Identifier (`service_qwc2v11`). | [dashboard.emailjs.com](https://dashboard.emailjs.com/) ➔ Email Services. |
| `EMAILJS_TEMPLATE_ID` | EmailJS Invoice Template Identifier (`template_kiv2ph2`).| [dashboard.emailjs.com](https://dashboard.emailjs.com/) ➔ Email Templates. |
| `EMAILJS_PUBLIC_KEY` | EmailJS account Public Key (`f7Xq2k5J4HeAmh5H3`). | [dashboard.emailjs.com](https://dashboard.emailjs.com/) ➔ Account ➔ API Keys. |
| `EMAILJS_PRIVATE_KEY` | EmailJS account Private / Access Token. | [dashboard.emailjs.com](https://dashboard.emailjs.com/) ➔ Account ➔ API Keys. |
| `MASTER_ADMIN_EMAILS` | Comma-separated list of Master Admin email addresses. | Set in `.env`. |

---

## 5. 🚀 Starting & Testing the Whole Application

1. **Terminal 1: Start Backend**:
   ```bash
   cd server
   npm run dev
   ```
   *Expected Output*:
   ```
   Server running on http://localhost:5000
   ✅ MongoDB Connected: cluster0-shard-00-00.e32jvv6.mongodb.net
   📦 MongoDB Products: 16 already seeded, skipping.
   ```

2. **Terminal 2: Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   *Expected Output*:
   ```
   VITE v8.2.2  ready in 250 ms
   ➜  Local:   http://localhost:5173/
   ```

3. Open **`http://localhost:5173`** in your browser to access the complete luxury storefront!
