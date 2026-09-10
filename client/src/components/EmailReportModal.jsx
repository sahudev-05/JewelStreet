import React, { useState, useEffect } from 'react';
import { sendReportViaEmailJS, sendEmailJSFromBrowser } from '../services/emailjsService';
import './EmailReportModal.css';

const EmailReportModal = ({ isOpen, onClose, reportType, reportData, defaultEmail = '' }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('Valued Recipient');
  const [customNote, setCustomNote] = useState('');
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    if (defaultEmail) {
      setRecipientEmail(defaultEmail);
    }
  }, [defaultEmail, isOpen]);

  if (!isOpen) return null;

  // Generate formatted text summary for email
  const generateSummaryText = () => {
    if (!reportData) return 'No data available';

    if (reportType === 'inventory') {
      const summary = reportData.summary || {};
      const lowStock = (reportData.items || []).filter((it) => it.status !== 'In Stock');
      let text = `📦 JEWEL STREET - INVENTORY REPORT SUMMARY\n`;
      text += `--------------------------------------\n`;
      text += `Total Products: ${summary.totalProducts || 0}\n`;
      text += `Total Stock Units: ${summary.totalStockUnits || 0}\n`;
      text += `Total Value: ₹${(summary.totalInventoryValue || 0).toLocaleString('en-IN')}\n`;
      text += `Low Stock Warning Items: ${summary.lowStockItems || 0}\n`;
      text += `Out of Stock Items: ${summary.outOfStockItems || 0}\n\n`;
      if (lowStock.length > 0) {
        text += `Attention Needed Items:\n`;
        lowStock.forEach((it, i) => {
          text += `${i + 1}. ${it.name} (${it.category}) - Stock: ${it.stock} [${it.status}]\n`;
        });
      }
      if (customNote) text += `\nNote: ${customNote}`;
      return text;
    } else if (reportType === 'sales') {
      const summary = reportData.summary || {};
      const topItems = reportData.topItems || [];
      let text = `📊 JEWEL STREET - SALES & REVENUE REPORT\n`;
      text += `--------------------------------------\n`;
      text += `Total Revenue: ₹${(summary.totalRevenue || 0).toLocaleString('en-IN')}\n`;
      text += `Total Orders: ${summary.totalOrders || 0}\n`;
      text += `Average Order Value: ₹${(summary.avgOrderValue || 0).toLocaleString('en-IN')}\n\n`;
      if (topItems.length > 0) {
        text += `Top Bestsellers:\n`;
        topItems.forEach((it, i) => {
          text += `${i + 1}. ${it.name} (Qty Sold: ${it.qty})\n`;
        });
      }
      if (customNote) text += `\nNote: ${customNote}`;
      return text;
    } else if (reportType === 'order') {
      const itemsSummary = (reportData.items || [])
        .map((it, i) => `${i + 1}. ${it.name || it.product?.name || 'Item'} x${it.quantity || 1} - ₹${((it.price || it.product?.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}`)
        .join('\n');
      let text = `👑 JEWEL STREET - ORDER RECEIPT #${reportData.invoiceNo || reportData._id}\n`;
      text += `--------------------------------------\n`;
      text += `Total Amount: ₹${(reportData.totalAmount || 0).toLocaleString('en-IN')}\n`;
      text += `Order Status: ${reportData.status || 'Processing'}\n\n`;
      text += `Items Purchased:\n${itemsSummary}\n`;
      if (customNote) text += `\nNote: ${customNote}`;
      return text;
    }

    return 'Jewel Street Analytics Report';
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSending(true);
    setStatusMessage(null);

    try {
      if (reportType === 'order') {
        await sendEmailJSFromBrowser({
          customerName: recipientName || reportData.customerName || 'Valued Customer',
          customerEmail: recipientEmail,
          invoiceNo: reportData.invoiceNo || reportData._id,
          deliveryAddress: reportData.deliveryAddress || 'Address on file',
          pincode: reportData.pincode || '',
          phone: reportData.phone || '',
          totalAmount: reportData.totalAmount || 0,
          items: reportData.items || [],
        });
      } else {
        const title = reportType === 'inventory' ? '📦 Jewel Street Inventory Report' : '📊 Jewel Street Sales Performance Report';
        await sendReportViaEmailJS({
          recipientEmail,
          recipientName,
          reportTitle: title,
          reportSummaryText: generateSummaryText(),
        });
      }

      setStatusMessage({
        type: 'success',
        text: `✨ Report successfully sent to ${recipientEmail} via EmailJS!`,
      });
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 2200);
    } catch (err) {
      console.error('EmailJS send error:', err);
      setStatusMessage({
        type: 'error',
        text: `Failed to send email via EmailJS: ${err.message || 'Check EmailJS API credentials.'}`,
      });
    } finally {
      setSending(false);
    }
  };

  const reportTitleLabel =
    reportType === 'inventory'
      ? '📦 Inventory Analytics Report'
      : reportType === 'sales'
      ? '📊 Sales Performance Report'
      : `📜 Order Receipt #${reportData?.invoiceNo || ''}`;

  return (
    <div className="email-modal-overlay" onClick={onClose}>
      <div className="email-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="email-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Jewel Street"
              style={{ height: '36px', width: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(230,185,126,0.6)', flexShrink: 0 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h3>
              <i className="fas fa-paper-plane" style={{ marginRight: '8px', color: '#e6b97e' }}></i>
              Send Report via EmailJS
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSendEmail} className="email-modal-body">
          <div className="report-badge-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="JS Logo"
              style={{ height: '28px', width: '28px', borderRadius: '50%', objectFit: 'cover', opacity: 0.85, flexShrink: 0 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span><strong>Target Document:</strong> {reportTitleLabel}</span>
          </div>

          {statusMessage && (
            <div className={`status-banner ${statusMessage.type}`}>
              {statusMessage.type === 'success' ? '✅ ' : '⚠️ '}
              {statusMessage.text}
            </div>
          )}

          <div className="form-group">
            <label>Recipient Name</label>
            <input
              type="text"
              placeholder="e.g. Executive Manager / Admin"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Recipient Email Address *</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Custom Note (Optional)</label>
            <input
              type="text"
              placeholder="Add an optional message or instruction..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Report Summary Preview</label>
            <textarea className="summary-preview" value={generateSummaryText()} readOnly rows={6} />
          </div>

          <div className="email-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <button type="submit" className="btn-send" disabled={sending}>
              {sending ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Dispatching Email...
                </>
              ) : (
                <>
                  <i className="fas fa-envelope"></i> Send via EmailJS
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailReportModal;
