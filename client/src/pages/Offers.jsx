import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Offers.css';

const DEFAULT_OFFERS = [
  {
    id: 'cpn_jewel10',
    code: 'JEWEL10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 0,
    description: '10% Instant Discount across all BIS Hallmarked 22K & 18K fine jewelry.',
    isActive: true
  },
  {
    id: 'cpn_freeship',
    code: 'FREESHIP',
    discountType: 'flat',
    discountValue: 1500,
    minPurchase: 0,
    description: 'Free Insured Armored Security Transit & Delivery (₹1,500 off checkout).',
    isActive: true
  },
  {
    id: 'cpn_save500',
    code: 'SAVE500',
    discountType: 'flat',
    discountValue: 500,
    minPurchase: 5000,
    description: '₹500 Flat Savings on handcrafted jewelry purchases above ₹5,000.',
    isActive: true
  },
  {
    id: 'cpn_royal20',
    code: 'ROYAL20',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 50000,
    description: '👑 Royal Patronage: 20% Grand Discount on luxury orders above ₹50,000.',
    isActive: true
  }
];

const Offers = () => {
  const [coupons, setCoupons] = useState(DEFAULT_OFFERS);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchLiveCoupons();
  }, []);

  const fetchLiveCoupons = async () => {
    try {
      const res = await axios.get('/api/coupons/all');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const activeOnly = res.data.filter(c => c.isActive !== false);
        if (activeOnly.length > 0) {
          setCoupons(activeOnly);
        }
      }
    } catch (e) {
      console.warn('Using default offers fallback:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="offers-page">
      {/* Toast Notification */}
      {copiedCode && (
        <div className="offer-toast">
          <i className="fas fa-check-circle" style={{ color: '#4ecdc4', marginRight: '8px' }}></i>
          Code <strong>{copiedCode}</strong> copied to clipboard! Apply at checkout in your cart.
        </div>
      )}

      {/* Hero Banner */}
      <section className="offers-hero">
        <span className="offers-badge"><i className="fas fa-crown"></i> EXCLUSIVE SAVINGS & PRIVILEGES</span>
        <h1 className="offers-title">Promotional Offers & Luxury Vouchers</h1>
        <p className="offers-subtitle">
          Enjoy verified promotional discount codes and privileges on authentic BIS Hallmarked 22K & 18K fine gold, diamond, and bridal jewelry collections.
        </p>
      </section>

      {/* Active Coupons Grid */}
      <div className="offers-container">
        <div className="offers-header-row">
          <div>
            <h2 style={{ color: '#e6b97e', margin: 0, fontSize: '1.4rem' }}>
              <i className="fas fa-tags" style={{ marginRight: '8px' }}></i> Active Promotional Codes ({coupons.length})
            </h2>
            <p style={{ color: '#a599c2', margin: '4px 0 0', fontSize: '0.88rem' }}>
              Select any code below to copy and apply directly in your shopping bag.
            </p>
          </div>
          <button onClick={fetchLiveCoupons} className="refresh-offers-btn">
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Refresh Deals
          </button>
        </div>

        <div className="offers-grid">
          {coupons.map((cpn) => {
            const isPercent = cpn.discountType === 'percentage';
            const valueDisplay = isPercent ? `${cpn.discountValue}% OFF` : `₹${Number(cpn.discountValue).toLocaleString('en-IN')} OFF`;
            const isCopied = copiedCode === cpn.code;

            return (
              <div key={cpn.id || cpn.code} className="offer-card">
                <div className="offer-card-top">
                  <span className="offer-discount-pill">
                    <i className="fas fa-sparkles"></i> {valueDisplay}
                  </span>
                  <span className="offer-category-tag">
                    {cpn.minPurchase > 0 ? `Min Cart: ₹${Number(cpn.minPurchase).toLocaleString('en-IN')}` : 'No Min. Order'}
                  </span>
                </div>

                <h3 className="offer-card-heading">{cpn.description || 'Promotional Store Discount'}</h3>

                <div className="coupon-code-box">
                  <div className="code-display">
                    <span className="code-label">PROMO CODE:</span>
                    <strong className="code-text">{cpn.code}</strong>
                  </div>
                  <button
                    onClick={() => handleCopy(cpn.code)}
                    className={`copy-code-btn ${isCopied ? 'copied' : ''}`}
                    title="Copy coupon code"
                  >
                    <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'}`}></i>
                    {isCopied ? ' COPIED' : ' COPY'}
                  </button>
                </div>

                <div className="offer-card-footer">
                  <span className="offer-terms">
                    <i className="fas fa-shield-alt"></i> 100% Certified BIS 91.6 & 75 Purity Guaranteed
                  </span>
                  <Link to="/cart" className="apply-offer-link">
                    Apply at Cart →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Redeem Step Guide */}
        <section className="how-to-redeem-section">
          <h2 className="section-heading">How to Redeem Your Exclusive Offers</h2>
          <div className="redeem-steps-grid">
            <div className="redeem-step-card">
              <div className="step-number">1</div>
              <div className="step-icon"><i className="fas fa-copy"></i></div>
              <h3>Copy Your Code</h3>
              <p>Click "COPY" on any active coupon card above to save the code to your clipboard.</p>
            </div>
            <div className="redeem-step-card">
              <div className="step-number">2</div>
              <div className="step-icon"><i className="fas fa-gem"></i></div>
              <h3>Select Fine Jewellery</h3>
              <p>Explore our rings, necklaces, bangles, and bullion coins and add them to your cart.</p>
            </div>
            <div className="redeem-step-card">
              <div className="step-number">3</div>
              <div className="step-icon"><i className="fas fa-receipt"></i></div>
              <h3>Instant Cart Discount</h3>
              <p>Select your coupon from the dropdown in your cart to enjoy automatic savings instantly.</p>
            </div>
          </div>
        </section>

        {/* Offers Assurance */}
        <div className="offers-cta-banner">
          <div>
            <h3>Ready to Discover Timeless Elegance?</h3>
            <p>Every order includes tamper-proof insured delivery, BIS Hallmark authenticity, and certified billing.</p>
          </div>
          <Link to="/" className="explore-btn">
            Explore All Collections <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Offers;
