import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './Cart.css';

const COUPONS = {
  JEWEL10:  { label: 'JEWEL10 — 10% Off',      apply: (t)       => t * 0.9 },
  FREESHIP: { label: 'FREESHIP — Free Delivery', apply: (t, del) => t - del },
  SAVE500:  { label: 'SAVE500 — ₹500 Off',       apply: (t)       => t - 500 },
};
const DELIVERY = 1500;
const GST_RATE = 0.03;

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, updateCartItemPurity } = useCart();
  const [coupon, setCoupon] = useState('none');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedInvoiceNo, setConfirmedInvoiceNo] = useState('');
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentFailureReason, setPaymentFailureReason] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Auth gate: null = detecting, true = logged in, false = not logged in
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  // 'prompt' = show login/guest screen, 'guest' = proceed as guest
  const [authMode, setAuthMode] = useState('prompt');

  // Fetch live coupons from backend API
  React.useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('/api/coupons/all');
      if (res.data && Array.isArray(res.data)) {
        setAvailableCoupons(res.data.filter(c => c.isActive));
      }
    } catch (e) {
      setAvailableCoupons([
        { id: 'cpn_jewel10', code: 'JEWEL10', discountType: 'percentage', discountValue: 10, minPurchase: 0, description: '10% Off' },
        { id: 'cpn_freeship', code: 'FREESHIP', discountType: 'flat', discountValue: 1500, minPurchase: 0, description: 'Free Delivery (₹1,500 Off)' },
        { id: 'cpn_save500', code: 'SAVE500', discountType: 'flat', discountValue: 500, minPurchase: 5000, description: '₹500 Off' },
      ]);
    }
  };

  // Detect login state and prefill if logged in
  React.useEffect(() => {
    const savedUserStr = localStorage.getItem('jewel_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        // Only prefill if user actually has data (not an empty object)
        if (u && (u.name || u.email)) {
          setIsLoggedIn(true);
          setAuthMode('loggedin');
          if (u.name) setName(u.name);
          if (u.email) setEmail(u.email);
          if (u.phone) setPhone(u.phone);
          if (u.address) setAddress(u.address);
          if (u.pincode) setPincode(u.pincode);
        } else {
          setIsLoggedIn(false);
          setAuthMode('prompt');
        }
      } catch {
        setIsLoggedIn(false);
        setAuthMode('prompt');
      }
    } else {
      setIsLoggedIn(false);
      setAuthMode('prompt');
    }
  }, []);


  // 1-Click Location Detection API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Nominatim reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const street = addr.road || addr.suburb || addr.neighbourhood || '';
            const city = addr.city || addr.town || addr.village || addr.county || 'Bangalore';
            const state = addr.state || 'Karnataka';
            const postCode = addr.postcode || '560001';

            const fullAddress = [street, city, state].filter(Boolean).join(', ');
            setAddress(fullAddress || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
            setPincode(postCode.replace(/\D/g, '').slice(0, 6) || '560001');
            setLocationSuccess(true);
          } else {
            setAddress(`Detected Location: ${latitude.toFixed(4)} N, ${longitude.toFixed(4)} E, MG Road, Bangalore`);
            setPincode('560001');
            setLocationSuccess(true);
          }
        } catch {
          setAddress(`GPS Location: ${latitude.toFixed(4)} N, ${longitude.toFixed(4)} E, MG Road, Bangalore`);
          setPincode('560001');
          setLocationSuccess(true);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        alert(`Location permission denied or unavailable (${error.message}). Defaulting to Bangalore Store Address.`);
        setAddress('MG Road, Bangalore, Karnataka');
        setPincode('560001');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getSubtotal = () =>
    cartItems.reduce((sum, item) => {
      const match = item.price?.match(/[\d,]+/);
      const unitPrice = match ? parseInt(match[0].replace(/,/g, '')) : 0;
      const qty = item.quantity || item.qty || 1;
      return sum + (unitPrice * qty);
    }, 0);

  const subtotal = getSubtotal();
  const goldBaseValue = Math.round(subtotal * 0.82);
  const makingCharges = Math.round(subtotal * 0.18);
  const cgst = subtotal * 0.015;
  const sgst = subtotal * 0.015;
  const gst = cgst + sgst;
  let total = subtotal + gst + DELIVERY;
  if (coupon !== 'none' && COUPONS[coupon]) {
    total = COUPONS[coupon].apply(total, DELIVERY);
  }
  total = Math.max(0, total);
  const discount = Math.max(0, (subtotal + gst + DELIVERY) - total);

  // Helper to send verified payment to backend and place order atomically
  const completeVerifiedOrder = async (paymentData) => {
    const orderDetails = {
      customerName: name || 'Valued Client',
      customerEmail: (email || '').toLowerCase().trim(),
      phone: phone || '+91 9876543210',
      deliveryAddress: address || 'Store Address',
      pincode: pincode || '560001',
      cartItems,
      totalAmount: total,
      coupon,
      paymentMethod: 'Razorpay Online Secured'
    };

    try {
      const res = await axios.post('/api/payment/verify-and-place-order', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        orderDetails,
      });

      if (res.data?.success && res.data?.paymentStatus === 'Paid') {
        const inv = res.data.invoiceNo;
        setConfirmedInvoiceNo(inv);

        // Save in local storage history
        try {
          const localOrders = JSON.parse(localStorage.getItem('jewel_orders') || '[]');
          localOrders.unshift(res.data.order);
          localStorage.setItem('jewel_orders', JSON.stringify(localOrders));
        } catch (e) {}

        await clearCart();
        setPaymentFailed(false);
        setOrderPlaced(true);
      } else {
        setPaymentFailed(true);
        setPaymentFailureReason(res.data?.message || 'Payment verification was rejected by server.');
      }
    } catch (err) {
      console.error('Backend payment verification error:', err);
      setPaymentFailed(true);
      setPaymentFailureReason(err.response?.data?.message || 'Payment verification failed on server.');
    }
  };

  const handleRecordFailure = async (reason, orderId = null) => {
    try {
      await axios.post('/api/payment/record-failed-payment', {
        reason,
        orderId,
        orderDetails: {
          customerName: name || 'Valued Client',
          customerEmail: (email || '').toLowerCase().trim(),
          phone,
          deliveryAddress: address,
          pincode,
          cartItems,
          totalAmount: total
        }
      });
    } catch (e) {}
    setPaymentFailed(true);
    setPaymentFailureReason(reason || 'Transaction could not be completed.');
  };

  /* ── Razorpay Payment Handler ── */
  const handlePayment = async () => {
    if (!name || !address || !pincode || !phone || !email) {
      alert('Please fill in all delivery details including phone and email.');
      return;
    }
    if (cartItems.length === 0) { alert('Your cart is empty!'); return; }

    setPaymentLoading(true);
    setPaymentFailed(false);

    try {
      const { data } = await axios.post('/api/payment/create-order', {
        amount: total,
        currency: 'INR',
        receipt: `jewel_${Date.now()}`,
      });

      // Handle test mode simulation smoothly
      if (data?.isSimulated) {
        const confirmSim = window.confirm(
          `💳 Jewel Street Payment Gateway (Secured Test Simulation)\n\nTotal Payable: ₹${Math.round(total).toLocaleString('en-IN')}\nDeliver to: ${address}\n\nProceed with 1-Click Payment Verification on Backend?`
        );
        if (confirmSim) {
          await completeVerifiedOrder({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulated_sig',
          });
        } else {
          await handleRecordFailure('Payment cancelled by customer during simulation checkout', data.orderId);
        }
        setPaymentLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        // Fallback test simulation
        await completeVerifiedOrder({
          razorpay_order_id: data.orderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'simulated_sig',
        });
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Jewel Street',
        description: 'Haute Joaillerie Purchase',
        image: '/logo.png',
        order_id: data.orderId,
        handler: async (response) => {
          await completeVerifiedOrder({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setPaymentLoading(false);
        },
        prefill: { name, email, contact: phone },
        notes: { address, pincode },
        theme: { color: '#e6b97e' },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            handleRecordFailure('Payment cancelled or closed before completion', data.orderId);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        setPaymentLoading(false);
        await handleRecordFailure(response.error?.description || 'Payment declined by banking gateway', data.orderId);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      await handleRecordFailure(err.message || 'Payment initialization failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="cart-page">
        <div className="order-success" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="success-icon"><i className="fas fa-check-circle" style={{ color: '#e6b97e', fontSize: '3.5rem' }}></i></div>
          <h2 style={{ fontSize: '2.1rem', color: '#e6b97e', fontFamily: 'serif', margin: '14px 0 10px' }}>
            Payment Verified & Order Placed!
          </h2>
          {confirmedInvoiceNo && (
            <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '12px' }}>
              Official Tax Invoice No: <strong style={{ color: '#e6b97e' }}>{confirmedInvoiceNo}</strong>
            </div>
          )}
          <div style={{
            background: 'rgba(230, 185, 126, 0.12)',
            border: '1px solid rgba(230, 185, 126, 0.35)',
            borderRadius: '12px',
            padding: '14px 20px',
            margin: '16px 0 20px',
            color: '#e6b97e',
            fontSize: '1.05rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span><i className="fas fa-envelope" style={{ color: '#e6b97e' }}></i></span> Official Tax Invoice & Certified Bill Splitup dispatched to {email || 'your email'}
          </div>
          <p>Thank you for choosing Jewel Street Haute Joaillerie. Your pieces are being prepared for armored insured transit to <strong>{address || 'your registered delivery address'}</strong>.</p>

          <div style={{ marginTop: '28px', display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Link to="/profile" className="back-home-btn" style={{ background: 'transparent', border: '1px solid #e6b97e', color: '#e6b97e' }}>
              View My Orders
            </Link>
            <Link to="/" className="back-home-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Failed Screen with Retry ──
  if (paymentFailed) {
    return (
      <div className="cart-page">
        <div className="order-success" style={{ maxWidth: '620px', margin: '40px auto', border: '1px solid rgba(186, 75, 95, 0.4)', background: 'linear-gradient(145deg, #180018 0%, #0d0028 100%)' }}>
          <div className="success-icon">
            <i className="fas fa-exclamation-triangle" style={{ color: '#e89da9', fontSize: '3.5rem' }}></i>
          </div>
          <h2 style={{ fontSize: '2rem', color: '#e89da9', fontFamily: 'serif', margin: '14px 0 10px' }}>
            Payment Unsuccessful
          </h2>
          <div style={{
            background: 'rgba(186, 75, 95, 0.12)',
            border: '1px solid rgba(186, 75, 95, 0.35)',
            borderRadius: '10px',
            padding: '14px 18px',
            margin: '16px 0 20px',
            color: '#f0b0ba',
            fontSize: '0.95rem'
          }}>
            <strong>Reason:</strong> {paymentFailureReason || 'Transaction was declined by bank network or cancelled before verification.'}
          </div>
          <p style={{ color: '#d5ccf0', lineHeight: 1.6 }}>
            Don't worry! Your cart items and entered shipping details have been safely preserved. Your card or account was not charged.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setPaymentFailed(false); setPaymentFailureReason(''); }}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #e6b97e, #d4a060)',
                border: 'none',
                borderRadius: '8px',
                color: '#0d0028',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              🔄 Retry Payment Now
            </button>
            <Link
              to="/profile"
              style={{
                padding: '12px 22px',
                background: 'transparent',
                border: '1px solid rgba(230, 185, 126, 0.4)',
                borderRadius: '8px',
                color: '#e6b97e',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              💬 Contact Concierge
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon"><i className="fas fa-shopping-bag" style={{ color: '#e6b97e' }}></i></div>
            <h3>Your cart is empty</h3>
            <p>Explore our beautiful collection and add items to your cart.</p>
            <Link to="/" className="back-home-btn">Shop Now</Link>
          </div>
        ) : (
          <>
            {/* ── Auth Gate: show login/guest prompt for non-logged-in users ── */}
            {!isLoggedIn && authMode === 'prompt' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(230,185,126,0.12), rgba(212,160,96,0.04))',
                border: '1.5px solid rgba(230,185,126,0.4)',
                borderRadius: '16px',
                padding: '36px 28px',
                textAlign: 'center',
                marginBottom: '28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              }}>
                <img
                  src="/logo.png"
                  alt="Jewel Street"
                  style={{ height: '68px', width: '68px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e6b97e', marginBottom: '16px', display: 'block', margin: '0 auto 16px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h3 style={{ color: '#e6b97e', fontSize: '1.35rem', margin: '0 0 8px', fontFamily: 'serif' }}>
                  👑 Ready to Place Your Royal Order?
                </h3>
                <p style={{ color: '#c4b8e2', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: '1.6' }}>
                  Sign in to auto-fill your details, track orders & get exclusive member benefits.<br />
                  Or continue as a guest to proceed with manual entry.
                </p>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to="/login"
                    style={{
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg, #e6b97e, #d4a060)',
                      color: '#0d0028',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(230,185,126,0.35)',
                      transition: 'transform 0.15s',
                    }}
                  >
                    <i className="fas fa-sign-in-alt"></i> Sign In to Account
                  </Link>
                  <button
                    onClick={() => setAuthMode('guest')}
                    style={{
                      padding: '12px 28px',
                      background: 'transparent',
                      color: '#a599c2',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(165,153,194,0.45)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#e6b97e'; e.currentTarget.style.color = '#e6b97e'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(165,153,194,0.45)'; e.currentTarget.style.color = '#a599c2'; }}
                  >
                    <i className="fas fa-user-alt"></i> Continue as Guest
                  </button>
                </div>
                <p style={{ color: '#6b5f82', fontSize: '0.78rem', marginTop: '18px' }}>
                  <i className="fas fa-lock" style={{ marginRight: '4px' }}></i>
                  Your cart items are saved. You can always sign in later.
                </p>
              </div>
            )}

            {/* ── Show checkout form only if logged in OR guest mode chosen ── */}
            {(isLoggedIn || authMode === 'guest') && (
            <>
            {/* Cart Items */}

            <div className="cart-items">
              {cartItems.map((item, i) => (
                <div key={item.productId || i} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                    onError={e => { e.target.src = '/photos/product1.jpg'; }}
                  />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    
                    {/* Quality Selector */}
                    <div style={{ margin: '4px 0' }}>
                      <select
                        value={item.selectedQuality || (item.purity?.includes('91.6') ? '91.6' : '75')}
                        onChange={(e) => handleQualityChange(item.productId, e.target.value)}
                        style={{
                          background: '#090029',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--accent-primary)',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="91.6">22K (91.6% BIS Hallmarked Gold)</option>
                        <option value="75">18K (75.0% BIS Hallmarked Gold)</option>
                      </select>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#c4b8e2', margin: '2px 0' }}>{item.weight}</p>
                    <p className="cart-item-price">{item.price}</p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label="Remove item"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Delivery Details */}
            <div className="checkout-form">
              <h2><i className="fas fa-truck"></i> Delivery Details</h2>
              <div className="form-grid">
                <div className="form-row">
                  <label>Full Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
                </div>
                <div className="form-row">
                  <label>Phone *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
                </div>
                <div className="form-row full-width">
                  <label>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>

                {/* Address Field with Location Detector Button */}
                <div className="form-row full-width">
                  <div className="label-with-btn">
                    <label>Street Address *</label>
                    <button
                      type="button"
                      className="detect-loc-btn"
                      onClick={handleDetectLocation}
                      disabled={locating}
                    >
                      {locating ? (
                        <><i className="fas fa-spinner fa-spin"></i> Detecting...</>
                      ) : (
                        <><i className="fas fa-location-crosshairs"></i> Detect Current Location</>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House No, Street, Area, City"
                    required
                  />
                  {locationSuccess && (
                    <div className="loc-success-text">
                      <i className="fas fa-check-circle"></i> Auto-filled from your GPS location
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <label>Pincode *</label>
                  <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="6-digit pincode" maxLength={6} required />
                </div>
                <div className="form-row">
                  <label>Apply Coupon Offer</label>
                  <select value={coupon} onChange={e => setCoupon(e.target.value)}>
                    <option value="none">Select an Offer Coupon</option>
                    {availableCoupons.map(c => (
                      <option key={c.id || c.code} value={c.code}>
                        {c.code} — {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue.toLocaleString('en-IN')} Off`} {c.description ? `(${c.description})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bill-summary">
              <h2><i className="fas fa-receipt"></i> Full Bill & Tax Splitup</h2>
              <div className="bill-row sub-split">
                <span><i className="fas fa-coins" style={{ color: '#e6b97e' }}></i> Gross Gold & Gemstone Value</span>
                <span>₹{goldBaseValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bill-row sub-split">
                <span><i className="fas fa-hammer" style={{ color: '#e6b97e' }}></i> Atelier Making & Crafting (18%)</span>
                <span>₹{makingCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="bill-row sub-total">
                <span>Base Ornaments Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="bill-row sub-split">
                <span><i className="fas fa-file-invoice" style={{ color: '#a599c2' }}></i> Central GST (CGST @ 1.5%)</span>
                <span>₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="bill-row sub-split">
                <span><i className="fas fa-file-invoice" style={{ color: '#a599c2' }}></i> State GST (SGST @ 1.5%)</span>
                <span>₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="bill-row sub-split">
                <span><i className="fas fa-shield-alt" style={{ color: '#e6b97e' }}></i> Insured Armored Transit Delivery</span>
                <span>₹{DELIVERY.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="bill-row discount">
                  <span><i className="fas fa-tag"></i> Applied Offer Discount ({coupon})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="bill-row total">
                <span>Grand Total Amount Payable</span>
                <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="payment-section">
              <div className="payment-badges">
                <img src="https://razorpay.com/favicon.ico" alt="Razorpay" style={{width:16,height:16}} />
                <span>Secured by Razorpay</span>
                <span>•</span>
                <span>256-bit SSL</span>
                <span>•</span>
                <span>UPI | Cards | Net Banking | Wallets</span>
              </div>
              <button
                className="place-order-btn"
                onClick={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <><span className="btn-spinner"></span> Processing...</>
                ) : (
                  <><i className="fas fa-lock"></i> Pay ₹{total.toFixed(0)} Securely</>
                )}
              </button>
            </div>

            {/* Guest: nudge to create account for order tracking */}
            {!isLoggedIn && authMode === 'guest' && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(230,185,126,0.08)', border: '1px dashed rgba(230,185,126,0.35)', borderRadius: '10px', fontSize: '0.83rem', color: '#a599c2', textAlign: 'center' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '6px', color: '#e6b97e' }}></i>
                Ordering as a guest. <Link to="/login" style={{ color: '#e6b97e', fontWeight: 600 }}>Sign in or create an account</Link> to track your order and get updates.
              </div>
            )}
            </>
            )}
          </>
        )}

        <div className="back-link-wrap">
          <Link to="/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

