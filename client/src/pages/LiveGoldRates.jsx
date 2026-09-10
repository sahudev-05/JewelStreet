import React from 'react';
import { Link } from 'react-router-dom';
import GoldRateGraph from '../components/GoldRateGraph';
import './LiveGoldRates.css';

const LiveGoldRates = () => {
  return (
    <div className="live-rates-page">
      <div className="rates-page-banner">
        <span className="banner-subtitle">OFFICIAL BULLION & MARKET ANALYTICS</span>
        <h1 className="rates-page-title">Live Gold Rates & Historical Trends</h1>
        <p className="rates-page-desc">
          Real-time live present rates for 22K (91.6% purity), 18K (75.0% purity), and 24K Pure Gold bullion.
          Track 7-day historical price fluctuations and live market changes.
        </p>
      </div>

      <div className="rates-graph-container">
        <GoldRateGraph />
      </div>

      <div className="rates-info-grid">
        <div className="info-box">
          <i className="fas fa-certificate"></i>
          <h3>BIS 91.6 Hallmarking</h3>
          <p>All our 22K gold jewelry is stamped with official BIS Hallmark certification guaranteeing 91.6% gold purity.</p>
        </div>
        <div className="info-box">
          <i className="fas fa-calculator"></i>
          <h3>Transparent Billing</h3>
          <p>We provide itemized price receipts breaking down raw gold cost, 30% making charges, and 3% GST clearly.</p>
        </div>
        <div className="info-box">
          <i className="fas fa-shield-alt"></i>
          <h3>Insured Delivery</h3>
          <p>Every order is fully insured during transit with tamper-evident security packaging and tracking.</p>
        </div>
      </div>

      <div className="rates-back-wrap">
        <Link to="/" className="back-home-btn">
          <i className="fas fa-arrow-left"></i> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default LiveGoldRates;
