import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { favourites } = useFavourites();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('jewel_token');
    localStorage.removeItem('jewel_user');
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="header-logo">
        <Link to="/">
          <img src="/logo.png" alt="Jewel Street Logo" />
        </Link>
      </div>

      <div className="header-title">
        <Link to="/" className="brand-name">
          JEWEL STREET
          <span className="brand-subtitle">HAUTE JOAILLERIE</span>
        </Link>
      </div>

      <div className="header-icons">
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search rings, coins..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <i className="fa fa-search"></i>
          </button>
        </form>

        {/* User Account / Profile Icon with Interactive Dropdown */}
        {(() => {
          const activeUser = user || (localStorage.getItem('jewel_user') ? JSON.parse(localStorage.getItem('jewel_user')) : null);
          const MASTER_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];
          const userEmail = (activeUser?.email || '').toLowerCase().trim();
          const isMaster = MASTER_ADMINS.includes(userEmail) || activeUser?.role === 'master_admin';
          const isAdmin = isMaster || activeUser?.role === 'admin';

          const isDeev = userEmail.includes('deevyanshu');
          const emailPrefix = userEmail ? userEmail.split('@')[0] : 'User';
          const fallbackHeaderName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          const headerDisplayName = (activeUser?.name && (!activeUser.name.toLowerCase().includes('deevyanshu') || isDeev))
            ? activeUser.name
            : fallbackHeaderName;

          return (
            <div
              className="user-profile-menu-wrap"
              onMouseEnter={() => setProfileMenuOpen(true)}
              onMouseLeave={() => setProfileMenuOpen(false)}
            >
              <Link
                to={activeUser ? '/profile' : '/login'}
                className="icon-btn"
                title={activeUser ? (isMaster ? `👑 Master Admin: ${headerDisplayName}` : isAdmin ? `🛡️ Admin: ${headerDisplayName}` : `👤 Profile: ${headerDisplayName}`) : 'Sign In / Register'}
                onClick={() => setProfileMenuOpen(false)}
              >
                <i className={activeUser ? (isAdmin ? 'fas fa-user-shield' : 'fas fa-user-circle') : 'fa fa-user'}></i>
                {activeUser && (
                  <span className={`icon-badge ${isAdmin ? 'admin-badge-icon' : 'user-badge'}`}>
                    {isMaster ? '👑' : isAdmin ? 'A' : '✓'}
                  </span>
                )}
              </Link>

              {/* Dropdown Menu when user is logged in */}
              {activeUser && profileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                    <div className="dropdown-avatar">
                      {headerDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="dropdown-user-info">
                      <strong className="dropdown-name">{headerDisplayName}</strong>
                      <span className="dropdown-email">{activeUser.email}</span>
                      <div className="dropdown-designation">
                        {isMaster ? (
                          <span className="designation-pill master-pill">👑 Master Administrator</span>
                        ) : isAdmin ? (
                          <span className="designation-pill admin-pill">🛡️ Store Administrator</span>
                        ) : (
                          <span className="designation-pill member-pill">💎 Privilege Member</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="profile-dropdown-links">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-link admin-highlight-link"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <i className="fas fa-crown"></i> Admin Command Center
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="dropdown-link"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <i className="fas fa-id-card"></i> View Full Profile & Designation
                    </Link>
                    <Link
                      to="/profile"
                      className="dropdown-link"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <i className="fas fa-box"></i> Order History
                    </Link>
                  </div>

                  <div className="profile-dropdown-footer">
                    <button
                      className="dropdown-logout-btn"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <Link to="/cart" className="icon-btn" title="Cart">
          <i className="fas fa-shopping-bag"></i>
          {cartItems.length > 0 && (
            <span className="icon-badge">{cartItems.length}</span>
          )}
        </Link>

        <Link to="/favourites" className="icon-btn" title="Favourites">
          <i className="fa-solid fa-heart"></i>
          {favourites.length > 0 && (
            <span className="icon-badge fav-badge">{favourites.length}</span>
          )}
        </Link>

        <Link to="/location" className="icon-btn" title="Store Location">
          <i className="fas fa-location-dot"></i>
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span><span></span><span></span>
      </button>
    </header>
  );
};

export default Header;
