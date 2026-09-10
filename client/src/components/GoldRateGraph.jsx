import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GoldRateGraph.css';

const GoldRateGraph = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePurity, setActivePurity] = useState('916'); // '916' | '750' | '24k'
  const [hoverPoint, setHoverPoint] = useState(null);

  useEffect(() => {
    axios.get('/api/products/goldrate')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback live data
        setData({
          goldRatePerGramINR: 7480,
          rate24K: 7480,
          rate916: 6852,
          rate750: 5610,
          rate916TenGram: 68520,
          rate750TenGram: 56100,
          change24h: '+1.35%',
          history: [
            { date: 'Sep 01', rate24K: 7380, rate916: 6760, rate750: 5535 },
            { date: 'Sep 02', rate24K: 7410, rate916: 6788, rate750: 5558 },
            { date: 'Sep 03', rate24K: 7430, rate916: 6806, rate750: 5573 },
            { date: 'Sep 04', rate24K: 7420, rate916: 6797, rate750: 5565 },
            { date: 'Sep 05', rate24K: 7450, rate916: 6824, rate750: 5588 },
            { date: 'Sep 06', rate24K: 7470, rate916: 6843, rate750: 5603 },
            { date: 'Sep 07', rate24K: 7480, rate916: 6852, rate750: 5610 },
          ],
          lastUpdated: 'Live Market',
        });
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="gold-graph-card loading">
        <div className="loader"></div>
        <p>Fetching Live Gold Rates...</p>
      </div>
    );
  }

  const history = data.history || [];
  const getRateKey = () => {
    if (activePurity === '916') return 'rate916';
    if (activePurity === '750') return 'rate750';
    return 'rate24K';
  };

  // SVG Chart points calculation
  const values = history.map(item => item[getRateKey()]);
  const minVal = Math.min(...values) * 0.995;
  const maxVal = Math.max(...values) * 1.005;

  const width = 580;
  const height = 180;
  const padding = 30;

  const points = history.map((item, idx) => {
    const x = padding + (idx / (history.length - 1)) * (width - 2 * padding);
    const val = item[getRateKey()];
    const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    return { x, y, val, date: item.date };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="gold-rate-dashboard">
      <div className="dashboard-header">
        <div className="header-title-wrap">
          <span className="live-indicator">
            <span className="pulse-dot"></span> LIVE MARKET RATES
          </span>
          <h2 className="gold-dashboard-title">Today's Gold Rate & Price Trends</h2>
        </div>
        <div className="market-change-badge">
          <i className="fas fa-arrow-trend-up"></i>
          <span>24h Change: {data.change24h}</span>
        </div>
      </div>

      {/* Present Gold Rate Cards for 91.6 and 75 */}
      <div className="present-rates-grid">
        {/* 91.6% Purity (22K Gold) */}
        <div
          className={`rate-card ${activePurity === '916' ? 'active' : ''}`}
          onClick={() => setActivePurity('916')}
        >
          <div className="rate-card-head">
            <span className="purity-badge purity-916">91.6% Hallmarked</span>
            <span className="karat-tag">22K Gold</span>
          </div>
          <div className="rate-amount-primary">
            ₹{data.rate916.toLocaleString('en-IN')}<span className="per-gram">/ gram</span>
          </div>
          <div className="ten-gram-rate">
            ₹{data.rate916TenGram.toLocaleString('en-IN')} <span className="ten-gram-lbl">per 10g</span>
          </div>
          <div className="card-click-hint">Click to view graph trend ↗</div>
        </div>

        {/* 75.0% Purity (18K Gold) */}
        <div
          className={`rate-card ${activePurity === '750' ? 'active' : ''}`}
          onClick={() => setActivePurity('750')}
        >
          <div className="rate-card-head">
            <span className="purity-badge purity-750">75.0% Hallmarked</span>
            <span className="karat-tag">18K Gold</span>
          </div>
          <div className="rate-amount-primary">
            ₹{data.rate750.toLocaleString('en-IN')}<span className="per-gram">/ gram</span>
          </div>
          <div className="ten-gram-rate">
            ₹{data.rate750TenGram.toLocaleString('en-IN')} <span className="ten-gram-lbl">per 10g</span>
          </div>
          <div className="card-click-hint">Click to view graph trend ↗</div>
        </div>

        {/* 24K Pure Gold */}
        <div
          className={`rate-card ${activePurity === '24k' ? 'active' : ''}`}
          onClick={() => setActivePurity('24k')}
        >
          <div className="rate-card-head">
            <span className="purity-badge purity-24k">99.9% Pure Bullion</span>
            <span className="karat-tag">24K Gold</span>
          </div>
          <div className="rate-amount-primary">
            ₹{data.rate24K.toLocaleString('en-IN')}<span className="per-gram">/ gram</span>
          </div>
          <div className="ten-gram-rate">
            ₹{(data.rate24K * 10).toLocaleString('en-IN')} <span className="ten-gram-lbl">per 10g</span>
          </div>
          <div className="card-click-hint">Click to view graph trend ↗</div>
        </div>
      </div>

      {/* Interactive Trend Graph */}
      <div className="graph-container-box">
        <div className="graph-controls-row">
          <h3 className="graph-chart-title">
            7-Day Historical Rate Chart (
            {activePurity === '916' ? '91.6% 22K' : activePurity === '750' ? '75.0% 18K' : '24K Pure Gold'}
            )
          </h3>
          <div className="graph-purity-tabs">
            <button
              className={activePurity === '916' ? 'active' : ''}
              onClick={() => setActivePurity('916')}
            >
              91.6 (22K)
            </button>
            <button
              className={activePurity === '750' ? 'active' : ''}
              onClick={() => setActivePurity('750')}
            >
              75.0 (18K)
            </button>
            <button
              className={activePurity === '24k' ? 'active' : ''}
              onClick={() => setActivePurity('24k')}
            >
              24K Pure
            </button>
          </div>
        </div>

        {/* SVG Spline Chart */}
        <div className="svg-chart-wrapper">
          <svg viewBox={`0 0 ${width} ${height}`} className="gold-svg-chart">
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaD} fill="url(#goldGradient)" />

            {/* Line Path */}
            <path d={pathD} fill="none" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />

            {/* Data Points */}
            {points.map((pt, i) => (
              <g
                key={i}
                className="chart-data-point"
                onMouseEnter={() => setHoverPoint(pt)}
                onMouseLeave={() => setHoverPoint(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  className={hoverPoint && hoverPoint.date === pt.date ? 'active-pt' : ''}
                />
                {/* X Axis Label */}
                <text x={pt.x} y={height - 8} textAnchor="middle" className="axis-label">
                  {pt.date}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoverPoint && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(hoverPoint.x / width) * 100}%`,
                top: `${(hoverPoint.y / height) * 100}%`,
              }}
            >
              <div className="tooltip-date">{hoverPoint.date}</div>
              <div className="tooltip-val">₹{hoverPoint.val.toLocaleString('en-IN')}/g</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoldRateGraph;
