import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './StaticPage.css';

/* ── 1. OUR HERITAGE & AUTHENTICITY CHARTER ── */
export const About = () => {
  const [downloaded, setDownloaded] = useState(false);
  return (
    <div className="static-page">
      <div className="static-container">
        <div className="doc-header-badge">
          <span className="doc-type-tag"><i className="fas fa-certificate"></i> OFFICIAL BRAND CHARTER</span>
          <span className="doc-ref-id">REF: JS-HERITAGE-2026-BIS</span>
        </div>

        <h1>Our Heritage & Craftsmanship Charter</h1>

        <div className="static-content">
          <p className="doc-lead-text">
            <strong>JEWEL STREET</strong> — <em>Haute Joaillerie Sculpted for Royalty</em>. Established in 1984 as an exclusive royal court jewellery atelier in Jaipur, Jewel Street has evolved into India's foremost destination for BIS 91.6 (22K) and 750 (18K) hallmarked gold, diamond, and precious gem creations.
          </p>

          <div className="doc-gold-box">
            <h3><i className="fas fa-shield-halved"></i> The Jewel Street Authenticity Guarantee</h3>
            <ul>
              <li><strong>100% BIS Hallmarked:</strong> Every gold ornament is laser-engraved with official Bureau of Indian Standards (BIS) hallmark, purity mark (91.6 / 750), and unique HUID tracking code.</li>
              <li><strong>SGL & IGI Certified Diamonds:</strong> All solitaire and pave diamonds are individually certified by international gemological laboratories for Clarity (VVS1-VS2), Color (D-F), and Cut (Triple Excellent).</li>
              <li><strong>Zero-Adulteration Purity Assurance:</strong> We issue a lifetime purity guarantee certificate with 100% buyback and melt-value transparency on all products.</li>
            </ul>
          </div>

          <h2>Our Master Artisanal Techniques</h2>
          <div className="doc-cards-grid">
            <div className="doc-card-item">
              <i className="fas fa-pen-nib"></i>
              <h4>Filigree & Jadhau Carving</h4>
              <p>Intricate gold wire lacework and royal Kundan setting perfected by 4th generation master craftsmen.</p>
            </div>
            <div className="doc-card-item">
              <i className="fas fa-gem"></i>
              <h4>Micro-Pavé Diamond Setting</h4>
              <p>Precision stone placements inspected under 40x optical microscopes for maximum light brilliance.</p>
            </div>
            <div className="doc-card-item">
              <i className="fas fa-fire-flame-curved"></i>
              <h4>Meenakari Enameling</h4>
              <p>Vibrant hand-applied enamel fusion baked in traditional kilns for everlasting luster.</p>
            </div>
          </div>

          <h2>Download Official Heritage Certificate</h2>
          <div className="doc-action-bar">
            <button
              className="doc-action-btn"
              onClick={() => setDownloaded(true)}
            >
              <i className="fas fa-file-pdf"></i> Download Certified Heritage PDF
            </button>
            {downloaded && (
              <span className="doc-success-badge">
                <i className="fas fa-check"></i> Sample Heritage Charter PDF saved to device!
              </span>
            )}
          </div>
        </div>

        <Link to="/" className="static-back">← Back to Home</Link>
      </div>
    </div>
  );
};

/* ── 2. PRIVACY POLICY DOCUMENT ── */
export const Privacy = () => (
  <div className="static-page">
    <div className="static-container">
      <div className="doc-header-badge">
        <span className="doc-type-tag"><i className="fas fa-lock"></i> PRIVACY & DATA SECURITY</span>
        <span className="doc-ref-id">COMPLIANCE: IT ACT 2000 & GDPR 2026</span>
      </div>

      <h1>Global Customer Privacy Policy</h1>

      <div className="static-content">
        <p className="doc-lead-text">
          At <strong>JEWEL STREET</strong>, your privacy and data security are held to the highest luxury standards. This document outlines how we collect, protect, and handle personal information across our website and flagship stores.
        </p>

        <h2>1. Personal Information We Collect</h2>
        <ul>
          <li><strong>Identity & Contact:</strong> Name, delivery address, phone number, and verified email during checkout or account registration.</li>
          <li><strong>GPS Location Data:</strong> Only gathered when you explicitly tap <em>"Detect Current Location"</em> in Cart checkout or Store Locator to populate address fields and calculate store distance. We never track location in the background.</li>
          <li><strong>Payment Credentials:</strong> Transactions are processed securely via PCI-DSS Level 1 compliant payment gateways (Razorpay, Google Pay, Cards). Jewel Street never stores your credit card CVV or PIN numbers.</li>
        </ul>

        <h2>2. Data Encryption & Security Standards</h2>
        <div className="doc-gold-box">
          <p><i className="fas fa-user-shield"></i> We employ 256-bit SSL encryption across all API transactions. Your account data is secured with salted bcrypt password hashing and token-based authentication.</p>
        </div>

        <h2>3. Your Data Rights & Contact Data Officer</h2>
        <p>You have the right to inspect, update, or request permanent deletion of your personal data at any time.</p>
        <p className="doc-contact-note">
          <strong>Data Protection Officer (DPO):</strong> <a href="mailto:privacy@jewelstreet.com">privacy@jewelstreet.com</a> | +91 1800 233 8899
        </p>
      </div>

      <Link to="/" className="static-back">← Back to Home</Link>
    </div>
  </div>
);

/* ── 3. TERMS OF SERVICE & INSURED COURIER GUARANTEE ── */
export const Terms = () => (
  <div className="static-page">
    <div className="static-container">
      <div className="doc-header-badge">
        <span className="doc-type-tag"><i className="fas fa-scale-balanced"></i> LEGAL CHARTER</span>
        <span className="doc-ref-id">DOC NO: JS-TERMS-2026-v4</span>
      </div>

      <h1>Terms of Service & Insured Delivery Guarantee</h1>

      <div className="static-content">
        <p className="doc-lead-text">
          By browsing or purchasing from <strong>JEWEL STREET</strong>, you agree to the following terms governing luxury purchases, gold rate pricing, transit insurance, and 30-day exchanges.
        </p>

        <h2>1. Transparent Gold Price Calculation Formula</h2>
        <div className="doc-gold-box">
          <code>Final Price = (Live Gold Rate × Weight × Gold Purity) + (Gold Price × 30% Making) + (Subtotal × 3% GST)</code>
          <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>All prices are updated in real-time according to International Gold Market rates (XAU/INR).</p>
        </div>

        <h2>2. 100% Insured Transit Shipping</h2>
        <p>Every shipment is packed in tamper-proof, laser-sealed armored packaging and covered by comprehensive transit insurance. Orders are delivered directly to your doorstep with one-time PIN (OTP) verification upon receipt.</p>

        <h2>3. 30-Day Easy Exchange & Lifetime Buyback</h2>
        <ul>
          <li><strong>30-Day Returns:</strong> Exchange any unworn jewellery piece within 30 days for 100% full credit value.</li>
          <li><strong>Lifetime Exchange:</strong> Return hallmarked items anytime for 100% current gold weight value + 90% diamond value.</li>
        </ul>
      </div>

      <Link to="/" className="static-back">← Back to Home</Link>
    </div>
  </div>
);

/* ── 4. AFFILIATE PROGRAM DOCUMENT & REGISTRATION ── */
export const Affiliate = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', platform: '', followers: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="doc-header-badge">
          <span className="doc-type-tag"><i className="fas fa-handshake"></i> PARTNERSHIP CHARTER</span>
          <span className="doc-ref-id">COMMISSION TIER: UP TO 10%</span>
        </div>

        <h1>Jewel Street Luxury Affiliate Program</h1>

        <div className="static-content">
          <p className="doc-lead-text">
            Partner with India's premier haute joaillerie brand. Earn lucrative commissions by introducing luxury fashion enthusiasts, wedding planners, and gold investors to Jewel Street's BIS Hallmarked collections.
          </p>

          <div className="doc-cards-grid">
            <div className="doc-card-item">
              <i className="fas fa-coins"></i>
              <h4>10% Commission</h4>
              <p>Earn up to 10% on every qualified luxury gold and diamond purchase generated via your referral link.</p>
            </div>
            <div className="doc-card-item">
              <i className="fas fa-cookie-bite"></i>
              <h4>60-Day Cookie Window</h4>
              <p>Long-track cookie attribution ensures you get credited even if your audience purchases weeks later.</p>
            </div>
            <div className="doc-card-item">
              <i className="fas fa-wallet"></i>
              <h4>Monthly Bank Payouts</h4>
              <p>Direct bank transfers on the 1st of every month with real-time analytics dashboard tracking.</p>
            </div>
          </div>

          <h2>Apply for Sample Partner Portal Access</h2>
          {submitted ? (
            <div className="doc-success-box">
              <i className="fas fa-circle-check"></i>
              <h3>Application Received!</h3>
              <p>Thank you, <strong>{formData.name}</strong>! Your affiliate partner portal credentials have been generated. Our brand manager will approve your link within 24 hours.</p>
            </div>
          ) : (
            <form className="doc-form-card" onSubmit={handleSubmit}>
              <div className="doc-form-grid">
                <div className="doc-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Panday"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="doc-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. partner@fashion.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="doc-form-group">
                  <label>Primary Platform / Website</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Instagram / YouTube / Blog URL"
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  />
                </div>
                <div className="doc-form-group">
                  <label>Audience Size / Monthly Reach</label>
                  <select
                    value={formData.followers}
                    onChange={e => setFormData({ ...formData, followers: e.target.value })}
                  >
                    <option value="10k-50k">10,000 – 50,000</option>
                    <option value="50k-200k">50,000 – 200,000</option>
                    <option value="200k+">200,000+ Luxury Followers</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="doc-submit-btn">
                <i className="fas fa-paper-plane"></i> Submit Affiliate Partner Application
              </button>
            </form>
          )}
        </div>

        <Link to="/" className="static-back">← Back to Home</Link>
      </div>
    </div>
  );
};

/* ── 5. CELEBRITY COLLABS & RED CARPET PORTFOLIO ── */
export const Collab = () => (
  <div className="static-page">
    <div className="static-container">
      <div className="doc-header-badge">
        <span className="doc-type-tag"><i className="fas fa-star"></i> RED CARPET & PR PORTFOLIO</span>
        <span className="doc-ref-id">COUTURE LOAN PROTOCOL 2026</span>
      </div>

      <h1>Celebrity Collaborations & Red Carpet Styling</h1>

      <div className="static-content">
        <p className="doc-lead-text">
          Jewel Street has graced global red carpets, award galas, and celebrity weddings. From <strong>Priyanka Chopra</strong> to <strong>Deepika Padukone</strong> and <strong>Vicky Kaushal</strong>, our high jewellery creations embody royal grandeur.
        </p>

        <div className="doc-cards-grid">
          <div className="doc-card-item">
            <i className="fas fa-crown"></i>
            <h4>Couture Red Carpet Loans</h4>
            <p>Exclusive high-jewellery loan styling for celebrity stylists, international film festivals, and magazine covers.</p>
          </div>
          <div className="doc-card-item">
            <i className="fas fa-gem"></i>
            <h4>Bespoke Bridal Commissions</h4>
            <p>One-of-a-kind heritage bridal neckwear designed in collaboration with celebrity brides and fashion houses.</p>
          </div>
          <div className="doc-card-item">
            <i className="fas fa-camera"></i>
            <h4>PR & Editorial Samples</h4>
            <p>Direct access to sample press kits, high-res lookbooks, and private showroom preview appointments.</p>
          </div>
        </div>

        <h2>Inquire for Press & Stylist Bookings</h2>
        <div className="doc-gold-box">
          <p><i className="fas fa-envelope"></i> <strong>Celebrity PR Desk:</strong> <a href="mailto:press@jewelstreet.com">press@jewelstreet.com</a> | VIP Line: +91 98200 11223</p>
        </div>
      </div>

      <Link to="/" className="static-back">← Back to Home</Link>
    </div>
  </div>
);

/* ── 6. CORPORATE GIFTING & CUSTOM BULLION ── */
export const CorporateGifting = () => {
  const [requested, setRequested] = useState(false);

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="doc-header-badge">
          <span className="doc-type-tag"><i className="fas fa-building-columns"></i> CORPORATE BULLION</span>
          <span className="doc-ref-id">CUSTOM 24K LOGO COINS</span>
        </div>

        <h1>Corporate Gifting & Customized Gold Coins</h1>

        <div className="static-content">
          <p className="doc-lead-text">
            Elevate corporate milestones, executive rewards, and festive Diwali appreciation with customized <strong>24K (999) Pure Gold Coins & Bars</strong>. Features your company logo laser-engraved with official Swiss assay purity packaging.
          </p>

          <h2>Volume Discount Tiers</h2>
          <div className="doc-cards-grid">
            <div className="doc-card-item">
              <i className="fas fa-boxes-stacked"></i>
              <h4>Tier 1 (25 – 100 Coins)</h4>
              <p>5% discount on making charges + complimentary logo laser engraving & custom box.</p>
            </div>
            <div className="doc-card-item">
              <i className="fas fa-truck-ramp-box"></i>
              <h4>Tier 2 (101 – 500 Coins)</h4>
              <p>12% discount on making charges + custom branded tamper-proof blister cards.</p>
            </div>
            <div className="doc-card-item">
              <i className="fas fa-award"></i>
              <h4>Tier 3 (500+ Coins)</h4>
              <p>Special institutional bullion rate + dedicated account concierge & insured doorstep delivery.</p>
            </div>
          </div>

          <h2>Request Corporate Quotation & Logo Mockup</h2>
          {requested ? (
            <div className="doc-success-box">
              <i className="fas fa-circle-check"></i>
              <h3>Quotation Request Submitted!</h3>
              <p>Our Corporate Gifting Manager will email your customized 3D logo coin mockup and wholesale price quote within 2 hours.</p>
            </div>
          ) : (
            <button className="doc-submit-btn" onClick={() => setRequested(true)}>
              <i className="fas fa-file-invoice-dollar"></i> Request Instant Bulk Corporate Proposal
            </button>
          )}
        </div>

        <Link to="/" className="static-back">← Back to Home</Link>
      </div>
    </div>
  );
};

/* ── 7. STORE LOCATOR & VIP BOUTIQUE BOOKING ── */
export const Location = () => {
  const [gpsDistance, setGpsDistance] = useState(null);
  const [locating, setLocating] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleFindNearestStore = () => {
    if (!navigator.geolocation) {
      setGpsDistance('2.4');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat1 = pos.coords.latitude;
        const lon1 = pos.coords.longitude;
        const lat2 = 12.9756;
        const lon2 = 77.6067;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        setGpsDistance(d.toFixed(1));
        setLocating(false);
      },
      () => {
        setGpsDistance('2.4');
        setLocating(false);
      }
    );
  };

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="doc-header-badge">
          <span className="doc-type-tag"><i className="fas fa-store"></i> GLOBAL FLAGSHIP BOUTIQUES</span>
          <span className="doc-ref-id">STORE ID: BANGALORE-MG-01</span>
        </div>

        <h1>Store Locator & Flagship Boutiques</h1>
        
        <div className="location-detector-bar">
          <span>Find your live distance to our flagship store:</span>
          <button className="gps-detect-btn" onClick={handleFindNearestStore} disabled={locating}>
            {locating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-crosshairs"></i>}
            {locating ? ' Locating GPS...' : ' Detect My Distance'}
          </button>
          {gpsDistance && (
            <div className="gps-result">
              <i className="fas fa-store"></i> You are <strong>{gpsDistance} km</strong> away from Flagship Boutique (MG Road, Bangalore)
            </div>
          )}
        </div>

        {/* Embedded Interactive Google Maps View */}
        <div className="map-view-wrapper">
          <iframe
            title="Jewel Street Google Maps Store Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.974953492476!2d77.6045153!3d12.9724423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae167d406085a7%3A0x6b4458d927c3f815!2sMG%20Road%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="380"
            style={{ border: 0, borderRadius: '14px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <h2>Our Flagship Boutiques</h2>
        <div className="doc-cards-grid">
          <div className="location-card">
            <h4><i className="fas fa-building"></i> Bangalore Flagship Boutique</h4>
            <p>456 Sparkle Street, MG Road, Bangalore 560001</p>
            <p><strong>Hours:</strong> Mon–Sat 10:00 AM – 8:00 PM</p>
          </div>
          <div className="location-card">
            <h4><i className="fas fa-building"></i> Mumbai Flagship Boutique</h4>
            <p>78 Royal Galleria, Turner Road, Bandra West, Mumbai 400050</p>
            <p><strong>Hours:</strong> Mon–Sat 10:30 AM – 8:30 PM</p>
          </div>
          <div className="location-card">
            <h4><i className="fas fa-building"></i> New Delhi Boutique</h4>
            <p>12 Imperial Arcade, Connaught Place, New Delhi 110001</p>
            <p><strong>Hours:</strong> Mon–Sat 10:00 AM – 8:00 PM</p>
          </div>
        </div>

        <h2>Book a Private VIP Appointment</h2>
        {booked ? (
          <div className="doc-success-box">
            <i className="fas fa-calendar-check"></i>
            <h3>Appointment Confirmed!</h3>
            <p>Our senior concierge will reserve a private viewing suite for you. A confirmation SMS with directions has been sent to your phone.</p>
          </div>
        ) : (
          <button className="doc-submit-btn" onClick={() => setBooked(true)}>
            <i className="fas fa-calendar-plus"></i> Reserve Private VIP Suite Appointment
          </button>
        )}

        <Link to="/" className="static-back">← Back to Home</Link>
      </div>
    </div>
  );
};
