import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

const Login = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect away from login page to respective dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'master_admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate]);

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [locating, setLocating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'verify'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);
  const [showForgotPass, setShowForgotPass] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotMsg({ type: 'success', text: res.data.message });
      setForgotStep('verify');
      if (res.data.devOtp) {
        setForgotOtp(res.data.devOtp); // Auto-fill OTP for immediate testing convenience
      }
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send verification code' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPass.length < 6) {
      setForgotMsg({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPass,
      });
      setForgotMsg({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setEmail(forgotEmail);
        setPassword(forgotNewPass);
        setShowForgotModal(false);
        setForgotStep('request');
        setForgotMsg(null);
        setError('');
      }, 1800);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Load Google Identity Services script ── */
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogle();
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const initializeGoogle = () => {
    if (!window.google || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      {
        theme: 'filled_black',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      }
    );
  };

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google', { credential: response.credential, portal: 'customer' });
      const { token: t, ...userData } = res.data;
      if (userData.role === 'admin' || userData.role === 'master_admin') {
        setError('⛔ Access Denied: Administrator accounts must log in via the Admin Portal. Redirecting...');
        setTimeout(() => { window.location.href = '/admin'; }, 1500);
        return;
      }
      localStorage.setItem('token', t);
      localStorage.setItem('jewel_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      window.location.href = '/profile';
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isAdminAccount) {
        setError('⛔ Access Denied: Administrator accounts must log in via the Admin Portal. Redirecting...');
        setTimeout(() => { window.location.href = '/admin'; }, 1500);
        return;
      }
      setError('Google Sign-In failed. Please use email and password.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const handleGoogleBtnClick = () => {
    setShowGoogleModal(true);
  };

  const handleDirectGoogleLogin = async (acctEmail, acctName) => {
    if (!acctEmail || !acctEmail.trim()) {
      setError('Please enter your Google account email.');
      return;
    }
    const cleanEmail = acctEmail.toLowerCase().trim();
    const AUTHORIZED_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];
    const isAdminEmail = AUTHORIZED_ADMINS.includes(cleanEmail);

    // Deny admin Google login on customer login page
    if (isAdminEmail) {
      setError('⛔ Access Denied: Administrator accounts cannot sign in from the customer login page. Redirecting to Admin Portal...');
      setShowGoogleModal(false);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
      return;
    }

    setGoogleLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google-direct', {
        email: cleanEmail,
        name: acctName || cleanEmail.split('@')[0].replace('.', ' '),
        portal: 'customer'
      });
      const { token: t, ...userData } = res.data;
      localStorage.setItem('token', t);
      localStorage.setItem('jewel_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      // Customer always redirects to their respective account page: /profile
      window.location.href = '/profile';
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isAdminAccount) {
        setError('⛔ Access Denied: Administrator accounts must log in via the Admin Portal. Redirecting...');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
        return;
      }
      // Fallback local customer session
      const fallbackUser = {
        name: acctName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'customer'
      };
      localStorage.setItem('token', 'google_cust_token_2026');
      localStorage.setItem('jewel_user', JSON.stringify(fallbackUser));
      window.location.href = '/profile';
    } finally {
      setGoogleLoading(false);
      setShowGoogleModal(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data?.address?.city || data?.address?.town || data?.address?.state || 'Bangalore';
          setUserLocation(`${city}, India`);
        } catch {
          setUserLocation(`Bangalore, India`);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setUserLocation('Bangalore, India');
        setLocating(false);
      }
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = (email || '').toLowerCase().trim();
    const AUTHORIZED_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];
    const isAdminEmail = AUTHORIZED_ADMINS.includes(cleanEmail);

    // Deny admin login on customer login page and redirect to admin login
    if (isAdminEmail) {
      setError('⛔ Access Denied: Administrator accounts cannot sign in from the customer login page. Redirecting to Admin Portal...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const loggedUser = await login(email, password, 'customer');

        // Extra check if server returned an admin user
        if (loggedUser && (loggedUser.role === 'admin' || loggedUser.role === 'master_admin')) {
          setError('⛔ Access Denied: Administrator accounts must log in via the Admin Portal. Redirecting...');
          setTimeout(() => {
            window.location.href = '/admin';
          }, 1500);
          return;
        }

        // All customer logins redirect to their respective customer profile: /profile
        window.location.href = '/profile';
      } else {
        // Customer Registration
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }

        await register(name.trim(), email.trim(), password);
        // Customers redirect to their respective profile page
        window.location.href = '/profile';
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isAdminAccount) {
        setError('⛔ Access Denied: Administrator accounts cannot sign in through the customer login page. Redirecting to Admin Portal...');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
        return;
      }
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        {/* Form Side */}
        <div className="login-form-side">
          <div className="login-brand">
            <img src="/logo.png" alt="Jewel Street" />
            <span>Jewel Street</span>
          </div>

          <h1>{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h1>
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Sign in to access your cart and favourites.'
              : 'Join us to start your jewellery journey.'}
          </p>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {/* Google Sign In */}
          <div className="google-section">
            <button
              type="button"
              className="google-fallback-btn"
              onClick={handleGoogleBtnClick}
              disabled={googleLoading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
                <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
                <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"/>
                <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
          </div>

          <div className="divider"><span>or {mode === 'login' ? 'login' : 'sign up'} with email</span></div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'register' && (
              <>
                <div className="input-group">
                  <i className="fas fa-user"></i>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="input-group location-input-group">
                  <i className="fas fa-location-dot"></i>
                  <input
                    type="text"
                    placeholder="City / Region"
                    value={userLocation}
                    onChange={e => setUserLocation(e.target.value)}
                  />
                  <button
                    type="button"
                    className="loc-detect-btn-inline"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    title="Detect Current Location"
                  >
                    {locating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-crosshairs"></i>}
                  </button>
                </div>
              </>
            )}

            <div className="input-group">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail(email || '');
                    setForgotStep('request');
                    setForgotMsg(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e6b97e',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '2px 4px',
                    fontFamily: 'inherit'
                  }}
                >
                  <i className="fas fa-key" style={{ fontSize: '0.75rem', marginRight: '5px' }}></i>
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loader"></span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="login-toggle">
            {mode === 'login' ? (
              <>Don't have an account? <button onClick={() => { setMode('register'); setError(''); }}>Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
            )}
          </div>

          {/* Admin Sign In Button — Redirects to /admin */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px dashed rgba(230, 185, 126, 0.25)',
            textAlign: 'center',
          }}>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#a599c2', marginBottom: '8px' }}>
              Are you a store manager or staff?
            </span>
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: 'linear-gradient(135deg, rgba(230, 185, 126, 0.12), rgba(212, 160, 96, 0.05))',
                border: '1.5px solid #e6b97e',
                color: '#e6b97e',
                padding: '11px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                letterSpacing: '0.4px',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e6b97e, #d4a060)';
                e.currentTarget.style.color = '#0d0028';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 185, 126, 0.12), rgba(212, 160, 96, 0.05))';
                e.currentTarget.style.color = '#e6b97e';
              }}
            >
              <i className="fas fa-crown" style={{ fontSize: '0.9rem' }}></i>
              Admin Sign In →
            </Link>
          </div>

          <div className="login-back">
            <Link to="/"><i className="fas fa-arrow-left"></i> Back to Home</Link>
          </div>
        </div>

        {/* Image Side */}
        <div className="login-image-side">
          <img src="/photos/login.jpg" alt="Jewellery" />
          <div className="login-image-overlay">
            <h2>Luxury You Deserve<br />Sparkle You Desire</h2>
          </div>
        </div>
      </div>

      {/* Google Customer Sign-In Modal */}
      {showGoogleModal && (
        <div className="google-modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={e => e.stopPropagation()}>
            <div className="google-modal-header">
              <svg width="34" height="34" viewBox="0 0 18 18">
                <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
                <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
                <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"/>
                <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335"/>
              </svg>
              <h3>Customer Sign-In with Google</h3>
              <p>Sign in with your Google account to continue to <strong>Jewel Street</strong></p>
            </div>

            <div className="google-custom-input-box" style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.82rem', color: '#d5ccf0', marginBottom: '8px', display: 'block' }}>
                Enter your Google Account Email:
              </label>
              <div className="google-input-row">
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={customGoogleEmail}
                  onChange={e => setCustomGoogleEmail(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customGoogleEmail.trim()) {
                      handleDirectGoogleLogin(customGoogleEmail.trim());
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="google-direct-submit"
                  disabled={googleLoading}
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleDirectGoogleLogin(customGoogleEmail.trim());
                    }
                  }}
                >
                  {googleLoading ? 'Signing in...' : 'Sign In →'}
                </button>
              </div>
              <span style={{ display: 'block', marginTop: '10px', fontSize: '0.74rem', color: '#9a8bb8' }}>
                🔒 Secure Google Identity Services · Authenticates directly to your Customer Profile.
              </span>
            </div>

            <button className="google-modal-close" onClick={() => setShowGoogleModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="google-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div
            className="google-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px', background: 'linear-gradient(145deg, #0d0033 0%, #06001a 100%)', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '16px', padding: '28px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(230, 185, 126, 0.15)', border: '1px solid #e6b97e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#e6b97e', fontSize: '1.3rem' }}>
                <i className="fas fa-lock"></i>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: '0 0 6px', fontFamily: "'Georgia', serif" }}>
                {forgotStep === 'request' ? 'Reset Account Password' : 'Create New Password'}
              </h3>
              <p style={{ color: '#a599c2', fontSize: '0.85rem', margin: 0 }}>
                {forgotStep === 'request'
                  ? 'Enter your registered email to receive a 6-digit verification code.'
                  : `Enter the code sent to ${forgotEmail} and set your new password.`}
              </p>
            </div>

            {forgotMsg && (
              <div style={{
                marginBottom: '18px',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                background: forgotMsg.type === 'success' ? 'rgba(198, 217, 190, 0.14)' : 'rgba(186, 75, 95, 0.14)',
                border: `1px solid ${forgotMsg.type === 'success' ? '#c6d9be' : '#e89da9'}`,
                color: forgotMsg.type === 'success' ? '#c6d9be' : '#e89da9',
              }}>
                <i className={`fas fa-${forgotMsg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} style={{ marginRight: '6px' }}></i>
                {forgotMsg.text}
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestOtp}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Registered Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-envelope" style={{ position: 'absolute', left: '12px', top: '13px', color: '#a599c2' }}></i>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 12px 11px 36px',
                        background: '#090029',
                        border: '1px solid rgba(230, 185, 126, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.92rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #e6b97e, #d4a060)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0d0028',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(230, 185, 126, 0.25)'
                  }}
                >
                  {forgotLoading ? 'Sending Verification Code...' : 'Send Verification Code →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    required
                    maxLength={6}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#090029',
                      border: '1px solid rgba(230, 185, 126, 0.3)',
                      borderRadius: '8px',
                      color: '#e6b97e',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      letterSpacing: '5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    New Password * (min 6 characters)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-lock" style={{ position: 'absolute', left: '12px', top: '13px', color: '#a599c2' }}></i>
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      value={forgotNewPass}
                      onChange={e => setForgotNewPass(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '11px 36px 11px 36px',
                        background: '#090029',
                        border: '1px solid rgba(230, 185, 126, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.92rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#a599c2', cursor: 'pointer' }}
                    >
                      <i className={`fas ${showForgotPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Confirm New Password *
                  </label>
                  <input
                    type={showForgotPass ? 'text' : 'password'}
                    value={forgotConfirmPass}
                    onChange={e => setForgotConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      background: '#090029',
                      border: '1px solid rgba(230, 185, 126, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #e6b97e, #d4a060)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0d0028',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(230, 185, 126, 0.25)'
                  }}
                >
                  {forgotLoading ? 'Updating Password...' : '🔒 Set New Password & Finish'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => { setForgotStep('request'); setForgotMsg(null); }}
                    style={{ background: 'none', border: 'none', color: '#a599c2', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ← Back: Request a different code
                  </button>
                </div>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: '#a599c2', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
