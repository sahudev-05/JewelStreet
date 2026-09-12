import React, { useState } from 'react';

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
export const CategoryDonutChart = ({ categoryStats = {}, title = 'Category Valuation Share' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const categories = Object.entries(categoryStats || {}).map(([name, stats]) => ({
    name,
    value: stats.value || 0,
    units: stats.count || 0,
    products: stats.products || 0,
  })).filter(c => c.value > 0);

  const totalValue = categories.reduce((sum, c) => sum + c.value, 0);

  if (categories.length === 0 || totalValue === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#a599c2', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        No valuation data to display chart.
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 260;
  const center = size / 2;
  const radius = 100;
  const innerRadius = 62;

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

    // SVG donut slice path
    const pathData = `
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
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#e6b97e', margin: 0, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🥧</span> {title}
        </h4>
        <span style={{ fontSize: '0.78rem', color: '#a599c2' }}>{categories.length} Categories</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', gap: '20px' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {slices.map((s, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <path
                  key={s.name}
                  d={s.pathData}
                  fill={s.color}
                  stroke="#0d0028"
                  strokeWidth="2"
                  opacity={hoveredIdx === null || isHovered ? 1 : 0.45}
                  filter={isHovered ? 'url(#goldGlow)' : 'none'}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, opacity 0.2s ease',
                    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
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
            maxWidth: '110px'
          }}>
            {activeSlice ? (
              <>
                <div style={{ fontSize: '0.72rem', color: activeSlice.color, fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {activeSlice.name}
                </div>
                <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 'bold' }}>
                  ₹{(activeSlice.value / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '0.7rem', color: '#e6b97e' }}>
                  {activeSlice.percentage}%
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.68rem', color: '#a599c2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Value
                </div>
                <div style={{ fontSize: '0.95rem', color: '#e6b97e', fontWeight: 'bold' }}>
                  ₹{(totalValue / 100000).toFixed(1)}L
                </div>
                <div style={{ fontSize: '0.68rem', color: '#a599c2' }}>
                  100% Stock
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', flex: 1, minWidth: '220px' }}>
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
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: isHovered ? 'rgba(230, 185, 126, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isHovered ? s.color : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }}></span>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.78rem', color: '#fff', textTransform: 'capitalize', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#e6b97e' }}>
                    ₹{(s.value || 0).toLocaleString('en-IN')} ({s.percentage}%)
                  </div>
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
 * Category Stock Units vs Products Bar Chart
 */
export const CategoryStockBarChart = ({ categoryStats = {} }) => {
  const [activeCat, setActiveCat] = useState(null);

  const categories = Object.entries(categoryStats || {}).map(([name, stats]) => ({
    name,
    stock: stats.count || 0,
    products: stats.products || 0,
    value: stats.value || 0
  })).filter(c => c.stock > 0 || c.products > 0);

  if (categories.length === 0) return null;

  const maxStock = Math.max(...categories.map(c => c.stock), 10);
  const chartHeight = 180;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#e6b97e', margin: 0, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> Category Inventory Units (Bar Chart)
        </h4>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e6b97e' }}>
            <span style={{ width: '10px', height: '10px', background: 'linear-gradient(180deg, #e6b97e, #b8860b)', borderRadius: '2px' }}></span> Stock Units
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38bdf8' }}>
            <span style={{ width: '10px', height: '10px', background: '#38bdf8', borderRadius: '2px' }}></span> Product Designs
          </span>
        </div>
      </div>

      {/* Bar Chart Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', height: `${chartHeight}px`, paddingTop: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {categories.map((cat) => {
          const stockHeight = Math.max((cat.stock / maxStock) * (chartHeight - 30), 8);
          const prodHeight = Math.max((cat.products / maxStock) * (chartHeight - 30), 6);
          const isHovered = activeCat === cat.name;

          return (
            <div
              key={cat.name}
              onMouseEnter={() => setActiveCat(cat.name)}
              onMouseLeave={() => setActiveCat(null)}
              style={{
                flex: 1,
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
                  bottom: `${stockHeight + 35}px`,
                  background: '#0d0028',
                  border: '1px solid #e6b97e',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.72rem',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}>
                  <strong style={{ color: '#e6b97e' }}>{cat.name.toUpperCase()}</strong><br />
                  📦 Stock: {cat.stock} units<br />
                  💎 Designs: {cat.products}<br />
                  💰 Value: ₹{(cat.value || 0).toLocaleString('en-IN')}
                </div>
              )}

              <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                {/* Stock Bar */}
                <div
                  style={{
                    width: '45%',
                    maxWidth: '32px',
                    height: `${stockHeight}px`,
                    background: isHovered
                      ? 'linear-gradient(180deg, #f0dbbf, #e6b97e)'
                      : 'linear-gradient(180deg, #e6b97e, #b8860b)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.2s ease',
                    boxShadow: isHovered ? '0 0 12px rgba(230, 185, 126, 0.5)' : 'none'
                  }}
                />
                {/* Products Bar */}
                <div
                  style={{
                    width: '30%',
                    maxWidth: '20px',
                    height: `${prodHeight}px`,
                    background: '#38bdf8',
                    borderRadius: '3px 3px 0 0',
                    opacity: 0.85
                  }}
                />
              </div>

              {/* Category Label below axis */}
              <div style={{
                marginTop: '8px',
                fontSize: '0.72rem',
                color: isHovered ? '#e6b97e' : '#a599c2',
                fontWeight: isHovered ? 'bold' : 'normal',
                textTransform: 'capitalize',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%'
              }}>
                {cat.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Monthly Revenue & Orders Bar Chart (Sales Report)
 */
export const MonthlyRevenueBarChart = ({ monthly = [] }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  if (!monthly || monthly.length === 0) return null;

  const maxRevenue = Math.max(...monthly.map(m => m.revenue || 0), 1000);
  const chartHeight = 190;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#e6b97e', margin: 0, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📈</span> Monthly Revenue Trend (Bar Graph)
        </h4>
        <span style={{ fontSize: '0.78rem', color: '#a599c2' }}>{monthly.length} Months Tracked</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px', height: `${chartHeight}px`, paddingTop: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {monthly.map((m) => {
          const barHeight = Math.max(((m.revenue || 0) / maxRevenue) * (chartHeight - 40), 10);
          const isHovered = hoveredMonth === m.month;

          return (
            <div
              key={m.month}
              onMouseEnter={() => setHoveredMonth(m.month)}
              onMouseLeave={() => setHoveredMonth(null)}
              style={{
                flex: 1,
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
                  zIndex: 10,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
                  textAlign: 'center'
                }}>
                  <strong style={{ color: '#e6b97e' }}>{m.month}</strong><br />
                  💰 Revenue: ₹{(m.revenue || 0).toLocaleString('en-IN')}<br />
                  📦 Orders: {m.orders || 0}
                </div>
              )}

              {/* Value on top of bar */}
              <span style={{ fontSize: '0.68rem', color: isHovered ? '#fff' : '#a599c2', marginBottom: '4px' }}>
                ₹{((m.revenue || 0) / 1000).toFixed(0)}k
              </span>

              {/* Bar */}
              <div
                style={{
                  width: '70%',
                  maxWidth: '48px',
                  height: `${barHeight}px`,
                  background: isHovered
                    ? 'linear-gradient(180deg, #f0dbbf, #e6b97e)'
                    : 'linear-gradient(180deg, #e6b97e 0%, #b8860b 100%)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: isHovered ? '0 0 16px rgba(230, 185, 126, 0.6)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              />

              {/* Month Label */}
              <div style={{
                marginTop: '8px',
                fontSize: '0.75rem',
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
  );
};

/**
 * Order Status Breakdown Pie / Donut Chart (Sales Report)
 */
export const OrderStatusPieChart = ({ statusBreakdown = {} }) => {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const statuses = Object.entries(statusBreakdown || {}).map(([status, count]) => ({
    status,
    count: Number(count) || 0,
    color: STATUS_COLORS[status] || '#a78bfa'
  })).filter(s => s.count > 0);

  const totalOrders = statuses.reduce((sum, s) => sum + s.count, 0);

  if (statuses.length === 0 || totalOrders === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#a599c2', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        No order status data available yet.
      </div>
    );
  }

  const size = 220;
  const center = size / 2;
  const radius = 85;
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

    const pathData = `
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
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
      <h4 style={{ color: '#e6b97e', margin: '0 0 16px 0', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🥧</span> Order Fulfillment Pie Chart
      </h4>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
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
                  opacity={hoveredStatus === null || isHovered ? 1 : 0.45}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, opacity 0.2s ease',
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
                <div style={{ fontSize: '0.68rem', color: '#a599c2' }}>Orders</div>
                <div style={{ fontSize: '1.1rem', color: '#e6b97e', fontWeight: 'bold' }}>{totalOrders}</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Fulfillment</div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '160px' }}>
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
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isHovered ? s.color : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  fontSize: '0.78rem'
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
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
      <h4 style={{ color: '#e6b97e', margin: '0 0 16px 0', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🏆</span> Top Selling Fine Jewellery (Ranked Chart)
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {topItems.slice(0, 6).map((item, idx) => {
          const percent = ((item.qty || 0) / maxQty) * 100;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#fff', fontWeight: '500' }}>
                  <span style={{ color: '#e6b97e', marginRight: '6px' }}>#{idx + 1}</span>
                  {item.name}
                </span>
                <span style={{ color: '#e6b97e', fontWeight: 'bold' }}>{item.qty} units sold</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
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
                    transition: 'width 0.5s ease-out'
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
