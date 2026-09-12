import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-top">
      <div className="footer-brand-col">
        <span className="footer-title">JEWEL STREET</span>
        <p className="footer-tagline">Luxury You Deserve, Sparkle You Desire.</p>
        <p className="footer-desc">
          Crafting 100% BIS hallmarked 22K (91.6%) and 18K (75%) gold and diamond jewellery with timeless elegance.
        </p>
        <ul className="socials">
          <li><a href="#" aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a></li>
          <li><a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a></li>
          <li><a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a></li>
          <li><a href="#" aria-label="Twitter"><i className="bi bi-twitter"></i></a></li>
        </ul>
      </div>

      <div className="footer-info">
        <ul>
          <li className="footer-list-header">Fine Jewellery</li>
          <li><Link to="/rings">Rings</Link></li>
          <li><Link to="/necklace">Necklaces</Link></li>
          <li><Link to="/earrings">Earrings</Link></li>
          <li><Link to="/coin">Gold Coins (24K)</Link></li>
          <li><Link to="/bangles">Bangles & Bracelets</Link></li>
        </ul>

        <ul>
          <li className="footer-list-header">Customer Care</li>
          <li><Link to="/offers" style={{ color: '#e6b97e', fontWeight: 'bold' }}>🏷️ Exclusive Offers & Coupons</Link></li>
          <li><Link to="/live-gold-rates">Live Gold Rates</Link></li>
          <li><Link to="/about">Our Heritage</Link></li>
          <li><Link to="/privacy">Privacy Policy</Link></li>
          <li><Link to="/terms">Terms of Service</Link></li>
          <li><Link to="/location">Store Locator</Link></li>
        </ul>

        <ul>
          <li className="footer-list-header">Partnerships</li>
          <li><Link to="/affiliate">Affiliate Program</Link></li>
          <li><Link to="/collab">Celebrity Collabs</Link></li>
          <li><Link to="/corporate-gifting">Corporate Gifting</Link></li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <p className="footer-copy">© 2026 JEWEL STREET. All Rights Reserved. Certified Hallmark 91.6 & 75.</p>
    </div>
  </footer>
);

export default Footer;
