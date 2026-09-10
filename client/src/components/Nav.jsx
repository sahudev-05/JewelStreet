import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Nav.css';

const Nav = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionScroll = (sectionId) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const MASTER_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];
  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = user && (user.role === 'admin' || user.role === 'master_admin' || MASTER_ADMINS.includes(userEmail));

  return (
    <nav className="site-nav">
      <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
        <i className="fas fa-bars"></i> Explore Collections
      </button>

      <ul className={`nav-list ${mobileOpen ? 'mobile-open' : ''}`}>
        <li>
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
        </li>
        <li>
          <span className="nav-action-link" onClick={() => handleSectionScroll('shop')}>All Collections</span>
        </li>
        <li className="nav-dropdown">
          <span className="nav-dropbtn">Jewellery Categories ▾</span>
          <div className="nav-dropdown-content">
            <Link to="/rings" onClick={() => setMobileOpen(false)}>Rings</Link>
            <Link to="/men" onClick={() => setMobileOpen(false)}>Men's Collection</Link>
            <Link to="/necklace" onClick={() => setMobileOpen(false)}>Necklace</Link>
            <Link to="/chain" onClick={() => setMobileOpen(false)}>Gold Chain</Link>
            <Link to="/earrings" onClick={() => setMobileOpen(false)}>Earrings</Link>
            <Link to="/bracelets" onClick={() => setMobileOpen(false)}>Bracelets</Link>
            <Link to="/bangles" onClick={() => setMobileOpen(false)}>Bangles</Link>
            <Link to="/kada" onClick={() => setMobileOpen(false)}>Sovereign Kada</Link>
            <Link to="/coin" onClick={() => setMobileOpen(false)}>Gold Coins (24K)</Link>
            <Link to="/pendent" onClick={() => setMobileOpen(false)}>Pendants</Link>
            <Link to="/mangalsutra" onClick={() => setMobileOpen(false)}>Mangalsutra</Link>
            <Link to="/hair" onClick={() => setMobileOpen(false)}>Hair Accessories</Link>
          </div>
        </li>
        <li>
          <Link to="/live-gold-rates" onClick={() => setMobileOpen(false)}>Live Gold Rates</Link>
        </li>
        <li>
          <span className="nav-action-link" onClick={() => handleSectionScroll('review')}>Reviews</span>
        </li>
        <li>
          <Link to="/about" onClick={() => setMobileOpen(false)}>Our Heritage</Link>
        </li>
        <li>
          <span className="nav-action-link" onClick={() => handleSectionScroll('contact')}>Bespoke Contact</span>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
