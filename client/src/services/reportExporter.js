/**
 * Jewel Street - Business Reports & Invoices Exporter
 * Handles CSV Downloads and Formatted Printable PDF Documents with Logo Watermark
 */

/** Get absolute URL for logo (works in popup windows) */
const getLogoUrl = () => `${window.location.origin}/logo.png`;

/** Shared CSS injected into every PDF popup window */
const SHARED_PDF_STYLES = () => `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    background-color: #090029 !important;
    color: #fdfbf7 !important;
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', 'Inter', -apple-system, sans-serif;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  body {
    padding: 24px;
    line-height: 1.6;
    position: relative;
    min-height: 100vh;
  }

  /* ── Watermark logo: fixed centered over entire document ── */
  .watermark-logo {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-25deg);
    width: 480px;
    height: 480px;
    object-fit: contain;
    opacity: 0.09;
    pointer-events: none;
    z-index: 0;
    user-select: none;
    filter: drop-shadow(0 0 30px rgba(230, 185, 126, 0.3));
  }

  /* ── Page wrapper ── */
  .pdf-content {
    position: relative;
    z-index: 1;
    max-width: 860px;
    margin: 0 auto;
    background: #0d0038;
    border: 1.5px solid rgba(230, 185, 126, 0.4);
    border-radius: 16px;
    padding: 32px 36px;
    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85);
  }

  /* ── Print toolbar (hidden during print) ── */
  .print-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 860px;
    margin: 0 auto 16px;
    padding: 10px 16px;
    background: #12013b;
    border: 1px solid rgba(230, 185, 126, 0.3);
    border-radius: 10px;
  }

  .print-bar-title {
    font-size: 13px;
    color: #e6b97e;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .btn-print {
    padding: 9px 22px;
    background: linear-gradient(135deg, #e6b97e 0%, #c99355 100%);
    color: #090029;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.4px;
    box-shadow: 0 4px 14px rgba(230, 185, 126, 0.3);
    transition: transform 0.15s ease;
  }

  .btn-print:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(230, 185, 126, 0.45);
  }

  /* ── Document header ── */
  .doc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid rgba(230, 185, 126, 0.35);
    padding-bottom: 20px;
    margin-bottom: 26px;
    gap: 20px;
  }

  .doc-header-logo {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .doc-header-logo img {
    height: 64px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 10px rgba(230, 185, 126, 0.35));
  }

  .doc-brand h1 {
    margin: 0;
    font-family: 'Cinzel', serif;
    font-size: 24px;
    color: #fdfbf7;
    letter-spacing: 3px;
    line-height: 1.2;
  }

  .doc-brand p {
    margin: 3px 0 0;
    font-size: 11px;
    color: #e6b97e;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .doc-header-meta {
    text-align: right;
  }

  .doc-header-meta h2 {
    margin: 0 0 6px;
    font-family: 'Cinzel', serif;
    font-size: 18px;
    color: #e6b97e;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .doc-header-meta p {
    margin: 3px 0;
    font-size: 12px;
    color: #d5ccf0;
  }

  /* ── Metric cards ── */
  .metrics-grid {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 26px;
  }

  .metric-card {
    flex: 1;
    min-width: 130px;
    background: #12013b;
    border: 1px solid rgba(230, 185, 126, 0.28);
    border-radius: 10px;
    padding: 14px 12px;
    text-align: center;
  }

  .metric-card .label {
    font-size: 10px;
    text-transform: uppercase;
    color: #d5ccf0;
    font-weight: 700;
    letter-spacing: 0.6px;
    display: block;
    margin-bottom: 6px;
  }

  .metric-card .val {
    font-size: 22px;
    font-weight: 700;
    color: #e6b97e;
  }

  /* ── Section headings ── */
  h3 {
    color: #e6b97e;
    border-left: 4px solid #e6b97e;
    padding-left: 12px;
    font-size: 14px;
    margin: 24px 0 12px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-family: 'Cinzel', serif;
  }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 22px;
    font-size: 13px;
    background: #0d0038;
  }

  th, td {
    border: 1px solid rgba(230, 185, 126, 0.2);
    padding: 10px 14px;
    text-align: left;
  }

  th {
    background: #1b0254 !important;
    color: #e6b97e !important;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e6b97e !important;
  }

  td {
    color: #fdfbf7;
  }

  tr:nth-child(even) td {
    background: rgba(18, 1, 59, 0.7);
  }

  tr:hover td {
    background: rgba(230, 185, 126, 0.08);
  }

  /* ── Two-column layout ── */
  .two-col {
    display: flex;
    gap: 22px;
  }

  .two-col > div {
    flex: 1;
  }

  /* ── Status badges ── */
  .badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.4px;
    display: inline-block;
  }

  .badge.warning {
    background: rgba(230, 185, 126, 0.2);
    color: #e6b97e;
    border: 1px solid #e6b97e;
  }

  .badge.danger {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.5);
  }

  /* ── Details box (invoice) ── */
  .details-grid {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 26px;
    background: #12013b;
    padding: 18px 22px;
    border-radius: 12px;
    border: 1px solid rgba(230, 185, 126, 0.28);
  }

  .details-box h4 {
    margin: 0 0 8px;
    color: #e6b97e;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 700;
  }

  .details-box p {
    margin: 3px 0;
    font-size: 13px;
    color: #d5ccf0;
  }

  .details-box p strong {
    color: #fdfbf7;
  }

  /* ── Total row ── */
  .total-row td {
    font-weight: 700;
    font-size: 15px;
    color: #e6b97e !important;
    background: #1b0254 !important;
    border-top: 2px solid #e6b97e !important;
  }

  /* ── Footer ── */
  .doc-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-top: 36px;
    padding-top: 18px;
    border-top: 1px solid rgba(230, 185, 126, 0.3);
    font-size: 11px;
    color: #d5ccf0;
    text-align: center;
  }

  .doc-footer img {
    height: 32px;
    width: auto;
    opacity: 0.9;
  }

  /* ── Print mode with strict color retention ── */
  @media print {
    html, body {
      background-color: #090029 !important;
      color: #fdfbf7 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      padding: 0 !important;
    }
    .pdf-content {
      border: none !important;
      box-shadow: none !important;
      padding: 15px !important;
      background: #090029 !important;
    }
    .print-bar {
      display: none !important;
    }
    .watermark-logo {
      opacity: 0.06 !important;
    }
    th, .total-row td {
      background: #1b0254 !important;
      color: #e6b97e !important;
    }
    .details-grid, .metric-card {
      background: #12013b !important;
    }
  }
`;

const downloadCSV = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports Inventory Report as CSV file
 */
export const exportInventoryCSV = (inventoryReport) => {
  if (!inventoryReport) return;
  const dateStr = new Date().toISOString().slice(0, 10);

  let csv = 'JEWEL STREET - INVENTORY REPORT\n';
  csv += `Generated Date,${new Date().toLocaleString('en-IN')}\n\n`;

  csv += 'SUMMARY METRICS\n';
  csv += `Total Products,${inventoryReport.summary.totalProducts || 0}\n`;
  csv += `Total Stock Units,${inventoryReport.summary.totalStockUnits || 0}\n`;
  csv += `Total Inventory Value (INR),${inventoryReport.summary.totalInventoryValue || 0}\n`;
  csv += `Low Stock Items,${inventoryReport.summary.lowStockItems || 0}\n`;
  csv += `Out of Stock Items,${inventoryReport.summary.outOfStockItems || 0}\n\n`;

  csv += 'CATEGORY-WISE BREAKDOWN\n';
  csv += 'Category,Products Count,Total Units,Total Inventory Value (INR)\n';
  if (inventoryReport.categoryStats) {
    Object.entries(inventoryReport.categoryStats).forEach(([cat, stats]) => {
      csv += `"${cat}",${stats.products || 0},${stats.count || 0},${stats.value || 0}\n`;
    });
  }
  csv += '\n';

  csv += 'LOW / OUT OF STOCK ITEMS\n';
  csv += 'Product Name,Category,Stock Left,Status\n';
  if (inventoryReport.items) {
    inventoryReport.items
      .filter((it) => it.status !== 'In Stock')
      .forEach((it) => {
        csv += `"${it.name.replace(/"/g, '""')}","${it.category}",${it.stock},"${it.status}"\n`;
      });
  }

  downloadCSV(`Jewel_Street_Inventory_Report_${dateStr}.csv`, csv);
};

/**
 * Exports Sales Analytics Report as CSV file
 */
export const exportSalesCSV = (salesReport) => {
  if (!salesReport) return;
  const dateStr = new Date().toISOString().slice(0, 10);

  let csv = 'JEWEL STREET - SALES & REVENUE REPORT\n';
  csv += `Generated Date,${new Date().toLocaleString('en-IN')}\n\n`;

  csv += 'SUMMARY METRICS\n';
  csv += `Total Revenue (INR),${salesReport.summary.totalRevenue || 0}\n`;
  csv += `Total Orders,${salesReport.summary.totalOrders || 0}\n`;
  csv += `Average Order Value (INR),${salesReport.summary.avgOrderValue || 0}\n\n`;

  csv += 'MONTHLY REVENUE TREND\n';
  csv += 'Month,Orders Count,Revenue (INR)\n';
  if (salesReport.monthly) {
    salesReport.monthly.forEach((m) => {
      csv += `"${m.month}",${m.orders},${m.revenue}\n`;
    });
  }
  csv += '\n';

  csv += 'ORDER STATUS BREAKDOWN\n';
  csv += 'Status,Order Count\n';
  if (salesReport.statusBreakdown) {
    Object.entries(salesReport.statusBreakdown).forEach(([status, count]) => {
      csv += `"${status}",${count}\n`;
    });
  }
  csv += '\n';

  csv += 'TOP SELLING ITEMS\n';
  csv += 'Product Name,Quantity Sold\n';
  if (salesReport.topItems) {
    salesReport.topItems.forEach((it) => {
      csv += `"${it.name.replace(/"/g, '""')}",${it.qty}\n`;
    });
  }

  downloadCSV(`Jewel_Street_Sales_Report_${dateStr}.csv`, csv);
};

/**
 * Exports Orders list as CSV file
 */
export const exportOrdersCSV = (orders) => {
  if (!orders || !orders.length) return;
  const dateStr = new Date().toISOString().slice(0, 10);

  let csv = 'JEWEL STREET - ORDERS REPORT\n';
  csv += `Generated Date,${new Date().toLocaleString('en-IN')}\n\n`;
  csv += 'Invoice No,Customer Name,Customer Email,Phone,Total Amount (INR),Payment Status,Order Status,Placed Date\n';

  orders.forEach((o) => {
    const inv = o.invoiceNo || o._id || 'N/A';
    const name = o.customerName || o.user?.name || 'Customer';
    const email = o.customerEmail || o.user?.email || 'N/A';
    const phone = o.phone || 'N/A';
    const total = o.totalAmount || 0;
    const payStatus = o.paymentStatus || 'Paid';
    const orderStatus = o.status || 'Processing';
    const date = new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN');

    csv += `"${inv}","${name.replace(/"/g, '""')}","${email}",${phone},${total},"${payStatus}","${orderStatus}","${date}"\n`;
  });

  downloadCSV(`Jewel_Street_Orders_${dateStr}.csv`, csv);
};

/**
 * Opens a beautifully formatted print/PDF window for Inventory or Sales Report
 * — with logo.png as header logo + diagonal watermark
 */
export const exportReportPrintablePDF = (reportType, reportData) => {
  const printWindow = window.open('', '_blank', 'width=960,height=860');
  if (!printWindow) {
    alert('Please allow popups to download/print the PDF report.');
    return;
  }

  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const logoUrl = getLogoUrl();
  const reportTitle =
    reportType === 'inventory'
      ? 'INVENTORY & STOCK ANALYTICS REPORT'
      : 'SALES & REVENUE PERFORMANCE REPORT';
  const reportSubtitle =
    reportType === 'inventory'
      ? 'Comprehensive stock tracking, category analysis & alert overview'
      : 'Revenue performance, monthly trends & bestseller intelligence';

  let reportBodyHtml = '';

  if (reportType === 'inventory') {
    const summary = reportData.summary || {};
    const categoryStats = reportData.categoryStats || {};
    const items = reportData.items || [];

    reportBodyHtml = `
      <div class="metrics-grid">
        <div class="metric-card"><span class="label">Total Products</span><div class="val">${summary.totalProducts || 0}</div></div>
        <div class="metric-card"><span class="label">Stock Units</span><div class="val">${summary.totalStockUnits || 0}</div></div>
        <div class="metric-card"><span class="label">Inventory Value</span><div class="val">₹${(summary.totalInventoryValue || 0).toLocaleString('en-IN')}</div></div>
        <div class="metric-card"><span class="label">Low Stock Items</span><div class="val" style="color:#d97706;">${summary.lowStockItems || 0}</div></div>
        <div class="metric-card"><span class="label">Out of Stock</span><div class="val" style="color:#dc2626;">${summary.outOfStockItems || 0}</div></div>
      </div>

      <h3>📊 Category Breakdown</h3>
      <table>
        <thead><tr><th>Category</th><th>Products</th><th>Stock Units</th><th>Inventory Value</th></tr></thead>
        <tbody>
          ${Object.entries(categoryStats)
            .map(([cat, s]) => `<tr><td><strong>${cat}</strong></td><td>${s.products || 0}</td><td>${s.count || 0}</td><td>₹${(s.value || 0).toLocaleString('en-IN')}</td></tr>`)
            .join('')}
        </tbody>
      </table>

      <h3>⚠️ Low &amp; Out of Stock Alert Items</h3>
      <table>
        <thead><tr><th>Product Name</th><th>Category</th><th>Stock Left</th><th>Status</th></tr></thead>
        <tbody>
          ${items.filter((it) => it.status !== 'In Stock').length > 0
            ? items.filter((it) => it.status !== 'In Stock').map((it) =>
                `<tr><td>${it.name}</td><td>${it.category}</td><td>${it.stock}</td><td><span class="badge ${it.status === 'Out of Stock' ? 'danger' : 'warning'}">${it.status}</span></td></tr>`
              ).join('')
            : '<tr><td colspan="4" style="text-align:center; color:#16a34a; padding:16px;">✅ All inventory items are sufficiently stocked!</td></tr>'
          }
        </tbody>
      </table>
    `;
  } else {
    const summary = reportData.summary || {};
    const monthly = reportData.monthly || [];
    const statusBreakdown = reportData.statusBreakdown || {};
    const topItems = reportData.topItems || [];

    reportBodyHtml = `
      <div class="metrics-grid">
        <div class="metric-card"><span class="label">Total Revenue</span><div class="val">₹${(summary.totalRevenue || 0).toLocaleString('en-IN')}</div></div>
        <div class="metric-card"><span class="label">Total Orders</span><div class="val">${summary.totalOrders || 0}</div></div>
        <div class="metric-card"><span class="label">Avg Order Value</span><div class="val">₹${(summary.avgOrderValue || 0).toLocaleString('en-IN')}</div></div>
      </div>

      <div class="two-col">
        <div>
          <h3>📋 Order Status Breakdown</h3>
          <table>
            <thead><tr><th>Status</th><th>Orders</th></tr></thead>
            <tbody>
              ${Object.entries(statusBreakdown).map(([st, c]) => `<tr><td>${st}</td><td><strong>${c}</strong></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div>
          <h3>🏆 Top Selling Royal Jewellery</h3>
          <table>
            <thead><tr><th>Product</th><th>Units Sold</th></tr></thead>
            <tbody>
              ${topItems.map((it, i) => `<tr><td>${i + 1}. ${it.name}</td><td><strong>×${it.qty}</strong></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${monthly.length > 0 ? `
        <h3>📅 Monthly Revenue Trend</h3>
        <table>
          <thead><tr><th>Month</th><th>Orders</th><th>Revenue</th></tr></thead>
          <tbody>
            ${monthly.map((m) => `<tr><td>${m.month}</td><td>${m.orders}</td><td>₹${(m.revenue || 0).toLocaleString('en-IN')}</td></tr>`).join('')}
          </tbody>
        </table>
      ` : ''}
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Jewel Street — ${reportTitle}</title>
        <style>${SHARED_PDF_STYLES()}</style>
      </head>
      <body>
        <!-- Watermark Logo: fixed position over entire page -->
        <img src="${logoUrl}" alt="" class="watermark-logo" />

        <div class="print-bar">
          <span style="font-size:12px; color:#78350f; font-weight:600;">Jewel Street Confidential Report</span>
          <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <div class="pdf-content">
          <!-- Document Header with Logo -->
          <div class="doc-header">
            <div class="doc-header-logo">
              <img src="${logoUrl}" alt="Jewel Street Logo" onerror="this.style.display='none'" />
              <div class="doc-brand">
                <h1>JEWEL STREET</h1>
                <p>Royal Fine Jewellery &amp; Luxury Collection</p>
              </div>
            </div>
            <div class="doc-header-meta">
              <h2>${reportTitle}</h2>
              <p>${reportSubtitle}</p>
              <p style="margin-top:6px; color:#9ca3af;">Generated: ${dateStr}</p>
            </div>
          </div>

          <!-- Report Body -->
          ${reportBodyHtml}

          <!-- Footer with Logo Stamp -->
          <div class="doc-footer">
            <img src="${logoUrl}" alt="JS" onerror="this.style.display='none'" />
            <div>
              <p style="margin:0; font-weight:700; color:#fdfbf7;">© ${new Date().getFullYear()} Jewel Street Royal Jewellery</p>
              <p style="margin:2px 0 0; color:#e6b97e;">Certified 100% BIS Hallmarked Fine Jewellery · Confidential Business Report</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
};

/**
 * Opens a formatted print/PDF window for a single Order Invoice
 * — with logo.png as header logo + diagonal watermark
 */
export const exportInvoicePrintablePDF = (order) => {
  const printWindow = window.open('', '_blank', 'width=900,height=860');
  if (!printWindow) {
    alert('Please allow popups to download/print the invoice PDF.');
    return;
  }

  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const logoUrl = getLogoUrl();
  const items = order.items || [];

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Jewel Street Invoice — #${order.invoiceNo || 'INV'}</title>
        <style>
          ${SHARED_PDF_STYLES()}
          /* Invoice-specific overrides */
          .inv-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            background: rgba(230, 185, 126, 0.18);
            color: #e6b97e;
            border: 1px solid #e6b97e;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <!-- Watermark Logo: fixed position over entire page -->
        <img src="${logoUrl}" alt="" class="watermark-logo" />

        <div class="print-bar">
          <span class="print-bar-title">👑 Official Tax Invoice · Jewel Street</span>
          <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF Invoice</button>
        </div>

        <div class="pdf-content">
          <!-- Invoice Header with Logo -->
          <div class="doc-header">
            <div class="doc-header-logo">
              <img src="${logoUrl}" alt="Jewel Street Logo" onerror="this.style.display='none'" />
              <div class="doc-brand">
                <h1>JEWEL STREET</h1>
                <p>Royal Fine Jewellery &amp; Luxury Collection</p>
              </div>
            </div>
            <div class="doc-header-meta">
              <h2>OFFICIAL INVOICE</h2>
              <p><strong>Invoice No:</strong> ${order.invoiceNo || 'INV-' + order._id}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p style="margin-top:4px;"><span class="inv-status">${order.status || 'Completed'}</span></p>
            </div>
          </div>

          <!-- Billing & Payment Details -->
          <div class="details-grid">
            <div class="details-box">
              <h4>📦 Billed &amp; Shipped To:</h4>
              <p><strong>${order.customerName || order.shippingAddress?.fullName || 'Valued Customer'}</strong></p>
              <p>${order.customerEmail || order.user?.email || ''}</p>
              <p>${order.deliveryAddress || order.shippingAddress?.address || ''}, ${order.pincode || order.shippingAddress?.pincode || ''}</p>
              <p>Phone: ${order.phone || order.shippingAddress?.phone || 'N/A'}</p>
            </div>
            <div class="details-box" style="text-align:right;">
              <h4>💳 Payment Summary:</h4>
              <p><strong>Method:</strong> ${order.paymentMethod || 'Online Payment'}</p>
              <p><strong>Status:</strong> ${order.paymentStatus || 'Paid'}</p>
              <p><strong>Items:</strong> ${items.length} Product(s)</p>
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr><th>#</th><th>Item Description</th><th>Purity / Metal</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr>
            </thead>
            <tbody>
              ${items.map((it, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${it.name || it.product?.name || 'Jewellery Item'}</strong></td>
                  <td>${it.purity || '18K Gold'}</td>
                  <td>${it.quantity || 1}</td>
                  <td>₹${(it.price || it.product?.price || 0).toLocaleString('en-IN')}</td>
                  <td>₹${((it.price || it.product?.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5" style="text-align:right;">Grand Total Amount:</td>
                <td>₹${(order.totalAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <!-- Footer with Logo Stamp -->
          <div class="doc-footer">
            <img src="${logoUrl}" alt="JS" onerror="this.style.display='none'" />
            <div>
              <p style="margin:0; font-weight:700; color:#fdfbf7;">Thank you for your royal purchase!</p>
              <p style="margin:2px 0 0; color:#e6b97e;">✨ Certified 100% BIS Hallmarked · support@jewelstreet.com · 24×7 Customer Care</p>
              <p style="margin:2px 0 0; color:#9a8bb8; font-size:10px;">© ${new Date().getFullYear()} Jewel Street Royal Jewellery. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
};
