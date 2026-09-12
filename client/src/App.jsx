import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavouritesProvider } from './context/FavouritesContext';
import Header from './components/Header';
import Nav from './components/Nav';
import Footer from './components/Footer';
import IntroStamp from './components/IntroStamp';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Favourites from './pages/Favourites';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import LiveGoldRates from './pages/LiveGoldRates';
import Offers from './pages/Offers';
import { About, Privacy, Terms, Affiliate, Collab, CorporateGifting, Location } from './pages/StaticPages';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavouritesProvider>
            <div className="app-layout">
              <IntroStamp />
              <Header />
              <Nav />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Home />} />

                  {/* Functional pages — must come before /:category */}
                  <Route path="/live-gold-rates" element={<LiveGoldRates />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/coupons" element={<Offers />} />
                  <Route path="/search" element={<ProductList />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/favourites" element={<Favourites />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />

                  {/* Static info & documentation pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/affiliate" element={<Affiliate />} />
                  <Route path="/collab" element={<Collab />} />
                  <Route path="/corporate-gifting" element={<CorporateGifting />} />
                  <Route path="/location" element={<Location />} />

                  {/* Product category pages — dynamic wildcard */}
                  <Route path="/:category" element={<ProductList />} />

                  {/* 404 */}
                  <Route path="*" element={
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: '#07090e', minHeight: '60vh', color: '#94a3b8' }}>
                      <h1 style={{ color: '#38bdf8', fontSize: '4rem', margin: '0 0 16px' }}>404</h1>
                      <p>Page not found.</p>
                      <a href="/" style={{ color: '#38bdf8' }}>← Go Home</a>
                    </div>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </FavouritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
