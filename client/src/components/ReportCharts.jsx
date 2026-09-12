import React, { useState, useMemo } from 'react';

// Color palettes tailored for Jewel Street royal dark luxury aesthetic
const PALETTE = [
  '#e6b97e', // Royal Gold
  '#38bdf8', // Diamond Sky Blue
  '#34d399', // Emerald Green
  '#a78bfa', // Amethyst Purple
  '#fb7185', // Rose Ruby
  '#fbbf24', // Amber Gold
  '#818cf8', // Indigo Sapphire
  '#f472b6', // Pink Tourmaline
  '#2dd4bf', // Turquoise
  '#c084fc', // Lilac
  '#f59e0b', // Honey Gold
  '#60a5fa', // Soft Blue
  '#e879f9', // Orchid
  '#4ade80', // Mint
  '#f87171', // Coral
  '#94a3b8', // Platinum Slate
];

const STATUS_COLORS = {
  'Delivered': '#10b981',
  'In Armored Transit': '#38bdf8',
  'Out for Delivery': '#60a5fa',
  'Shipped': '#818cf8',
  'Processing': '#fbbf24',
  'Order Placed': '#e6b97e',
  'Cancelled': '#ef4444',
  'Return Requested': '#f97316',
  'Returned': '#ec4899'
};

/**
 * Interactive Donut / Pie Chart for Category Distribution
 */
export const CategoryDonutChart = ({ categoryStats = {}, selectedCategory = 'all', title = 'Valuation Distribution' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const categories = useMemo(() => {
    let list = Object.entries(categoryStats || {}).map(([name, stats]) => ({
      name,
      value: stats.value || 0,
      units: stats.count || 0,
      products: stats.products || 0,
    })).filter(c => c.value > 0);

    if (selectedCategory !== 'all') {
      list = list.filter(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    }

    return list.sort((a, b) => b.value - a.value);
  }, [categoryStats, selectedCategory]);

  const totalValue = useMemo(() => categories.reduce((sum, c) => sum + c.value, 0), [categories]);

  if (categories.length === 0 || totalValue === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#a599c2', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--border-color)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No valuation data for selected category filter.
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 240;
  const center = size / 2;
  const radius = 94;
  const innerRadius = 58;

  let accumulatedAngle = -90; // Start at top
  const slices = categories.map((cat, idx) => {
    const percentage = (cat.value / totalValue) * 100;
    const angle = (cat.value / totalValue) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const ix1 = center + innerRadius * Math.cos(endRad);
    const iy1 = center + innerRadius * Math.sin(endRad);
    const ix2 = center + innerRadius * Math.cos(startRad);
    const iy2 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = angle >= 359.9
      ? `M ${center - radius} ${center} A ${radius} ${radius} 0 1 0 ${center + radius} ${center} A ${radius} ${radius} 0 1 0 ${center - radius} ${center} M ${center - innerRadius} ${center} A ${innerRadius} ${innerRadius} 0 1 1 ${center + innerRadius} ${center} A ${innerRadius} ${innerRadius} 0 1 1 ${center - innerRadius} ${center} Z`
      : `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
        Z
      `;

    return {
      ...cat,
      color: PALETTE[idx % PALETTE.length],
      percentage: percentage.toFixed(1),
      pathData,
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '18px 20px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ color: '#e6b97e', margin: 0, fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🥧</span> {title}
        </h4>
        <span style={{ fontSize: '0.74rem', color: '#a599c2' }}>{categories.length} Categories</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((s, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <path
                  key={s.name}
                  d={s.pathData}
                  fill={s.color}
                  stroke="#0d0028"
                  strokeWidth="2"
                  opacity={hoveredIdx === null || isHovered ? 1 : 0.4}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.18s ease, opacity 0.18s ease',
                    transform: isHovered ? 'scale(1.035)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: '105px'
          }}>
            {activeSlice ? (
              <>
                <div style={{ fontSize: '0.72rem', color: activeSlice.color, fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {activeSlice.name}
                </div>
                <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 'bold' }}>
                  ₹{(activeSlice.value / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '0.68rem', color: '#e6b97e' }}>
                  {activeSlice.percentage}%
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.66rem', color: '#a599c2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Value
                </div>
                <div style={{ fontSize: '0.96rem', color: '#e6b97e', fontWeight: 'bold' }}>
                  ₹{(totalValue / 100000).toFixed(1)}L
                </div>
                <div style={{ fontSize: '0.66rem', color: '#38bdf8' }}>
                  {categories.length} Segments
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Compact Legend */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flex: 1,
          minWidth: '180px',
          maxHeight: '220px',
          overflowY: 'auto',
          paddingRight: '6px'
        }}>
          {slices.map((s, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={s.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: isHovered ? 'rgba(230, 185, 126, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isHovered ? s.color : 'rgba(255,255,255,0.04)'}`,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }}></span>
                  <span style={{ color: '#fff', textTransform: 'capitalize', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </span>
                </div>
                <strong style={{ color: '#e6b97e', fontSize: '0.72rem', flexShrink: 0, marginLeft: '6px' }}>
                  {s.percentage}%
                </strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Category Stock Units vs Products Bar Chart (Zero Overflow, Fully Grid Contained)
 */
export const CategoryStockBarChart = ({ categoryStats = {}, selectedCategory = 'all', displayLimit = 8, sortBy = 'valuation' }) => {
  const [activeCat, setActiveCat] = useState(null);

  const categories = useMemo(() => {
    let list = Object.entries(categoryStats || {}).map(([name, stats]) => ({
      name,
      stock: stats.count || 0,
      products: stats.products || 0,
      value: stats.value || 0
    })).filter(c => c.stock > 0 || c.products > 0);

    if (selectedCategory !== 'all') {
      list = list.filter(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (sortBy === 'valuation') {
      list.sort((a, b) => b.value - a.value);
    } else if (sortBy === 'stock') {
      list.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === 'products') {
      list.sort((a, b) => b.products - a.products);
    } else if (sortBy === 'alpha') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (displayLimit !== 'all') {
      list = list.slice(0, Number(displayLimit));
    }

    return list;
  }, [categoryStats, selectedCategory, displayLimit, sortBy]);

  if (categories.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#a599c2', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--border-color)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No category stock data found.
      </div>
    );
  }

  const maxStock = Math.max(...categories.map(c => c.stock), 10);
  const chartHeight = 175;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '18px 20px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      width: '100%',
      minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ color: '#e6b97e', margin: 0, fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> Category Units Breakdown
        </h4>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e6b97e' }}>
            <span style={{ width: '9px', height: '9px', background: 'linear-gradient(180deg, #e6b97e, #b8860b)', borderRadius: '2px' }}></span> Stock Units
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38bdf8' }}>
            <span style={{ width: '9px', height: '9px', background: '#38bdf8', borderRadius: '2px' }}></span> Designs
          </span>
        </div>
      </div>

      {/* Overflow-Safe Scrollable Bar Track */}
      <div style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
        paddingBottom: '4px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: categories.length <= 8 ? 'space-around' : 'flex-start',
          gap: '10px',
          height: `${chartHeight}px`,
          paddingTop: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          minWidth: categories.length > 8 ? `${categories.length * 48}px` : '100%'
        }}>
          {categories.map((cat) => {
            const stockHeight = Math.max((cat.stock / maxStock) * (chartHeight - 32), 8);
            const prodHeight = Math.max((cat.products / maxStock) * (chartHeight - 32), 6);
            const isHovered = activeCat === cat.name;

            return (
              <div
                key={cat.name}
                onMouseEnter={() => setActiveCat(cat.name)}
                onMouseLeave={() => setActiveCat(null)}
                style={{
                  flex: categories.length <= 8 ? 1 : 'none',
                  width: categories.length > 8 ? '44px' : 'auto',
                  maxWidth: '54px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: `${stockHeight + 28}px`,
                    background: '#0d0028',
                    border: '1px solid #e6b97e',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.8)'
                  }}>
                    <strong style={{ color: '#e6b97e' }}>{cat.name.toUpperCase()}</strong><br />
                    📦 Stock: {cat.stock} units<br />
                    💎 Designs: {cat.products}<br />
                    💰 Value: ₹{(cat.value || 0).toLocaleString('en-IN')}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                  {/* Stock Bar */}
                  <div
                    style={{
                      width: '16px',
                      height: `${stockHeight}px`,
                      background: isHovered
                        ? 'linear-gradient(180deg, #f0dbbf, #e6b97e)'
                        : 'linear-gradient(180deg, #e6b97e, #b8860b)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'all 0.18s ease',
                      boxShadow: isHovered ? '0 0 10px rgba(230, 185, 126, 0.5)' : 'none'
                    }}
                  />
                  {/* Products Bar */}
                  <div
                    style={{
                      width: '11px',
                      height: `${prodHeight}px`,
                      background: '#38bdf8',
                      borderRadius: '2px 2px 0 0',
                      opacity: 0.85
                    }}
                  />
                </div>

                {/* Category Label */}
                <div style={{
                  marginTop: '6px',
                  fontSize: '0.68rem',
                  color: isHovered ? '#e6b97e' : '#a599c2',
                  fontWeight: isHovered ? 'bold' : 'normal',
                  textTransform: 'capitalize',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }} title={cat.name}>
                  {cat.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Unified Inventory Report Graphs Section with Interactive Filter Bar
 */
export const InventoryReportGraphs = ({ categoryStats = {} }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayLimit, setDisplayLimit] = useState('8');
  const [sortBy, setSortBy] = useState('valuation');

  const allCategoryNames = useMemo(() => {
    return Object.keys(categoryStats || {}).sort();
  }, [categoryStats]);

  return (
    <div style={{ margin: '22px 0' }}>
      {/* Interactive Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        background: 'rgba(230, 185, 126, 0.08)',
        border: '1px solid rgba(230, 185, 126, 0.25)',
        borderRadius: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e6b97e', fontSize: '0.86rem', fontWeight: 'bold' }}>
          <span>🔍</span> Graph Analysis &amp; Filter Controls:
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#a599c2' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: '6px 10px',
                background: '#0d0028',
                border: '1px solid rgba(230, 185, 126, 0.35)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Categories ({allCategoryNames.length})</option>
              {allCategoryNames.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#a599c2' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '6px 10px',
                background: '#0d0028',
                border: '1px solid rgba(230, 185, 126, 0.35)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <option value="valuation">Highest Valuation (₹)</option>
              <option value="stock">Highest Stock Units</option>
              <option value="products">Most Product Models</option>
              <option value="alpha">Alphabetical (A → Z)</option>
            </select>
          </div>

          {/* Display Limit Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#a599c2' }}>View:</span>
            <select
              value={displayLimit}
              onChange={e => setDisplayLimit(e.target.value)}
              style={{
                padding: '6px 10px',
                background: '#0d0028',
                border: '1px solid rgba(230, 185, 126, 0.35)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <option value="6">Top 6 (Clean Fit)</option>
              <option value="8">Top 8 (Standard)</option>
              <option value="12">Top 12</option>
              <option value="all">All {allCategoryNames.length} Categories (Scrollable)</option>
            </select>
          </div>

          {/* Reset Filter */}
          {(selectedCategory !== 'all' || sortBy !== 'valuation' || displayLimit !== '8') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSortBy('valuation');
                setDisplayLimit('8');
              }}
              style={{
                padding: '6px 10px',
                background: 'transparent',
                border: '1px solid #e89da9',
                borderRadius: '6px',
                color: '#e89da9',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid of Charts (Zero Overflow, 100% Contained) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        <CategoryDonutChart
          categoryStats={categoryStats}
          selectedCategory={selectedCategory}
          title="Category Valuation Distribution"
        />
        <CategoryStockBarChart
          categoryStats={categoryStats}
          selectedCategory={selectedCategory}
          displayLimit={displayLimit}
          sortBy={sortBy}
        />
      </div>
    </div>
  );
};

/**
 * Monthly Revenue & Orders Bar Chart (Sales Report)
 */
export const MonthlyRevenueBarChart = ({ monthly = [], metric = 'revenue' }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  if (!monthly || monthly.length === 0) return null;

  const maxVal = metric === 'revenue'
    ? Math.max(...monthly.map(m => m.revenue || 0), 1000)
    : Math.max(...monthly.map(m => m.orders || 0), 5);

  const chartHeight = 185;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '20px',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ color: '#e6b97e', margin: 0, fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📈</span> Monthly Trend: {metric === 'revenue' ? 'Sales Revenue (₹)' : 'Order Volumes'}
        </h4>
        <span style={{ fontSize: '0.76rem', color: '#a599c2' }}>{monthly.length} Months Logged</span>
      </div>

      <div style={{ overflowX: 'auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: monthly.length <= 6 ? 'space-around' : 'flex-start',
          gap: '14px',
          height: `${chartHeight}px`,
          paddingTop: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          minWidth: monthly.length > 6 ? `${monthly.length * 60}px` : '100%'
        }}>
          {monthly.map((m) => {
            const val = metric === 'revenue' ? (m.revenue || 0) : (m.orders || 0);
            const barHeight = Math.max((val / maxVal) * (chartHeight - 40), 10);
            const isHovered = hoveredMonth === m.month;

            return (
              <div
                key={m.month}
                onMouseEnter={() => setHoveredMonth(m.month)}
                onMouseLeave={() => setHoveredMonth(null)}
                style={{
                  flex: monthly.length <= 6 ? 1 : 'none',
                  width: monthly.length > 6 ? '54px' : 'auto',
                  maxWidth: '68px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: `${barHeight + 35}px`,
                    background: '#0d0028',
                    border: '1px solid #e6b97e',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.8)',
                    textAlign: 'center'
                  }}>
                    <strong style={{ color: '#e6b97e' }}>{m.month}</strong><br />
                    💰 Revenue: ₹{(m.revenue || 0).toLocaleString('en-IN')}<br />
                    📦 Orders: {m.orders || 0}
                  </div>
                )}

                {/* Value on top of bar */}
                <span style={{ fontSize: '0.68rem', color: isHovered ? '#fff' : '#a599c2', marginBottom: '4px' }}>
                  {metric === 'revenue' ? `₹${(val / 1000).toFixed(0)}k` : `${val} ord`}
                </span>

                {/* Bar */}
                <div
                  style={{
                    width: '70%',
                    maxWidth: '42px',
                    height: `${barHeight}px`,
                    background: isHovered
                      ? 'linear-gradient(180deg, #f0dbbf, #e6b97e)'
                      : 'linear-gradient(180deg, #e6b97e 0%, #b8860b 100%)',
                    borderRadius: '5px 5px 0 0',
                    boxShadow: isHovered ? '0 0 16px rgba(230, 185, 126, 0.6)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                />

                {/* Month Label */}
                <div style={{
                  marginTop: '8px',
                  fontSize: '0.74rem',
                  color: isHovered ? '#e6b97e' : '#a599c2',
                  fontWeight: isHovered ? 'bold' : 'normal'
                }}>
                  {m.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Order Status Breakdown Pie / Donut Chart (Sales Report)
 */
export const OrderStatusPieChart = ({ statusBreakdown = {}, filterStatus = 'all' }) => {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const statuses = useMemo(() => {
    let list = Object.entries(statusBreakdown || {}).map(([status, count]) => ({
      status,
      count: Number(count) || 0,
      color: STATUS_COLORS[status] || '#a78bfa'
    })).filter(s => s.count > 0);

    if (filterStatus !== 'all') {
      list = list.filter(s => s.status.toLowerCase() === filterStatus.toLowerCase());
    }

    return list;
  }, [statusBreakdown, filterStatus]);

  const totalOrders = statuses.reduce((sum, s) => sum + s.count, 0);

  if (statuses.length === 0 || totalOrders === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#a599c2', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--border-color)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No order status data available.
      </div>
    );
  }

  const size = 220;
  const center = size / 2;
  const radius = 84;
  const innerRadius = 52;

  let accumulatedAngle = -90;
  const slices = statuses.map(s => {
    const percentage = (s.count / totalOrders) * 100;
    const angle = (s.count / totalOrders) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const ix1 = center + innerRadius * Math.cos(endRad);
    const iy1 = center + innerRadius * Math.sin(endRad);
    const ix2 = center + innerRadius * Math.cos(startRad);
    const iy2 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = angle >= 359.9
      ? `M ${center - radius} ${center} A ${radius} ${radius} 0 1 0 ${center + radius} ${center} A ${radius} ${radius} 0 1 0 ${center - radius} ${center} M ${center - innerRadius} ${center} A ${innerRadius} ${innerRadius} 0 1 1 ${center + innerRadius} ${center} A ${innerRadius} ${innerRadius} 0 1 1 ${center - innerRadius} ${center} Z`
      : `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
        Z
      `;

    return {
      ...s,
      percentage: percentage.toFixed(1),
      pathData
    };
  });

  const active = hoveredStatus !== null ? slices.find(s => s.status === hoveredStatus) : null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '18px 20px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      <h4 style={{ color: '#e6b97e', margin: '0 0 14px 0', fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🥧</span> Order Fulfillment Breakdown
      </h4>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((s) => {
              const isHovered = hoveredStatus === s.status;
              return (
                <path
                  key={s.status}
                  d={s.pathData}
                  fill={s.color}
                  stroke="#0d0028"
                  strokeWidth="2"
                  opacity={hoveredStatus === null || isHovered ? 1 : 0.4}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.18s ease, opacity 0.18s ease',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`
                  }}
                  onMouseEnter={() => setHoveredStatus(s.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })}
          </svg>

          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: '90px'
          }}>
            {active ? (
              <>
                <div style={{ fontSize: '0.7rem', color: active.color, fontWeight: 'bold' }}>{active.status}</div>
                <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 'bold' }}>{active.count}</div>
                <div style={{ fontSize: '0.68rem', color: '#e6b97e' }}>{active.percentage}%</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.66rem', color: '#a599c2' }}>Orders</div>
                <div style={{ fontSize: '1.05rem', color: '#e6b97e', fontWeight: 'bold' }}>{totalOrders}</div>
                <div style={{ fontSize: '0.66rem', color: '#10b981' }}>Total</div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '160px' }}>
          {slices.map((s) => {
            const isHovered = hoveredStatus === s.status;
            return (
              <div
                key={s.status}
                onMouseEnter={() => setHoveredStatus(s.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isHovered ? s.color : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  fontSize: '0.76rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></span>
                  {s.status}
                </span>
                <strong style={{ color: s.color }}>{s.count} ({s.percentage}%)</strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Top Selling Jewellery Horizontal Bar Chart (Sales Report)
 */
export const TopSellingBarChart = ({ topItems = [] }) => {
  if (!topItems || topItems.length === 0) return null;

  const maxQty = Math.max(...topItems.map(i => i.qty || 1), 1);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '18px 20px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      <h4 style={{ color: '#e6b97e', margin: '0 0 14px 0', fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🏆</span> Top Selling Fine Jewellery
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {topItems.slice(0, 6).map((item, idx) => {
          const percent = ((item.qty || 0) / maxQty) * 100;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#fff', fontWeight: '500' }}>
                  <span style={{ color: '#e6b97e', marginRight: '6px' }}>#{idx + 1}</span>
                  {item.name}
                </span>
                <span style={{ color: '#e6b97e', fontWeight: 'bold' }}>{item.qty} sold</span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: idx === 0
                      ? 'linear-gradient(90deg, #e6b97e, #f59e0b)'
                      : idx === 1
                        ? 'linear-gradient(90deg, #38bdf8, #818cf8)'
                        : 'linear-gradient(90deg, #a78bfa, #c084fc)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease-out'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Unified Sales Report Graphs Section with Filter Controls
 */
export const SalesReportGraphs = ({ salesReport = {} }) => {
  const [salesMetric, setSalesMetric] = useState('revenue');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div style={{ margin: '22px 0' }}>
      {/* Sales Graph Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        background: 'rgba(240, 219, 191, 0.08)',
        border: '1px solid rgba(230, 185, 126, 0.25)',
        borderRadius: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e6b97e', fontSize: '0.86rem', fontWeight: 'bold' }}>
          <span>📊</span> Sales Analytics Filters:
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Metric Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#a599c2' }}>Monthly Metric:</span>
            <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(230, 185, 126, 0.35)' }}>
              <button
                type="button"
                onClick={() => setSalesMetric('revenue')}
                style={{
                  padding: '5px 10px',
                  background: salesMetric === 'revenue' ? 'linear-gradient(135deg, #e6b97e, #d4a060)' : '#0d0028',
                  color: salesMetric === 'revenue' ? '#0d0028' : '#e6b97e',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => setSalesMetric('orders')}
                style={{
                  padding: '5px 10px',
                  background: salesMetric === 'orders' ? 'linear-gradient(135deg, #e6b97e, #d4a060)' : '#0d0028',
                  color: salesMetric === 'orders' ? '#0d0028' : '#e6b97e',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Order Volume
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#a599c2' }}>Fulfillment Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                background: '#0d0028',
                border: '1px solid rgba(230, 185, 126, 0.35)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="In Armored Transit">In Armored Transit</option>
              <option value="Processing">Processing</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Return Requested">Return Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      {salesReport.monthly && salesReport.monthly.length > 0 && (
        <MonthlyRevenueBarChart monthly={salesReport.monthly} metric={salesMetric} />
      )}

      {/* Grid of Status Pie and Top Items */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        <OrderStatusPieChart statusBreakdown={salesReport.statusBreakdown} filterStatus={statusFilter} />
        <TopSellingBarChart topItems={salesReport.topItems} />
      </div>
    </div>
  );
};
