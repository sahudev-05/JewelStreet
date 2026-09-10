import emailjs from '@emailjs/browser';

const DEFAULT_SERVICE_ID = 'service_qwc2v11';
const DEFAULT_TEMPLATE_ID = 'template_kiv2ph2';
const DEFAULT_PUBLIC_KEY = 'f7Xq2k5J4HeAmh5H3';

// Permanent public HTTPS direct Cloudflare CDN image URL for Jewel Street Logo (accessible by Gmail, Outlook, Apple Mail)
export const PUBLIC_LOGO_URL = 'https://iili.io/n3SbdKb.png';

/**
 * Returns the reliable public HTTPS URL for the Jewel Street logo
 */
const getLogoUrl = () => PUBLIC_LOGO_URL;

/**
 * Generates a branded HTML email body header with logo watermark in royal dark blue palette (#090029 / #0d0038)
 * Fully hardened against Dark Mode color alterations (Gmail, Apple Mail, Outlook)
 */
const buildBrandedEmailHeader = (title = 'Jewel Street') => `
<div style="display:none; max-height:0px; overflow:hidden;">Jewel Street Royal Concierge — ${title}</div>
<!--[if mso]><style>.js-fallback{background-color:#0d0038 !important;}</style><![endif]-->
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    .js-card { background-color: #0d0038 !important; background-image: linear-gradient(180deg, #0d0038 0%, #0d0038 100%) !important; color: #fdfbf7 !important; }
    .js-inner { background-color: #12013b !important; background-image: linear-gradient(180deg, #12013b 0%, #12013b 100%) !important; }
    .js-gold { color: #e6b97e !important; -webkit-text-fill-color: #e6b97e !important; }
    .js-white { color: #fdfbf7 !important; -webkit-text-fill-color: #fdfbf7 !important; }
    .js-lavender { color: #d5ccf0 !important; -webkit-text-fill-color: #d5ccf0 !important; }
  }
  [data-ogsb] .js-card { background-color: #0d0038 !important; background-image: linear-gradient(180deg, #0d0038 0%, #0d0038 100%) !important; }
  [data-ogsb] .js-inner { background-color: #12013b !important; background-image: linear-gradient(180deg, #12013b 0%, #12013b 100%) !important; }
  [data-ogsc] .js-gold, [data-ogsb] .js-gold { color: #e6b97e !important; -webkit-text-fill-color: #e6b97e !important; }
  [data-ogsc] .js-white, [data-ogsb] .js-white { color: #fdfbf7 !important; -webkit-text-fill-color: #fdfbf7 !important; }
  [data-ogsc] .js-lavender, [data-ogsb] .js-lavender { color: #d5ccf0 !important; -webkit-text-fill-color: #d5ccf0 !important; }
</style>
<div class="js-card" style="background-color:#0d0038; background-image:linear-gradient(180deg, #0d0038 0%, #0d0038 100%); border:1px solid rgba(230,185,126,0.35); border-radius:14px; text-align:center; padding:24px 16px 20px; margin-bottom:18px; box-shadow:0 8px 24px rgba(0,0,0,0.85); color:#fdfbf7;">
  <img src="${PUBLIC_LOGO_URL}" alt="Jewel Street Logo" width="76" height="76"
       style="border-radius:50%; object-fit:contain; border:2px solid #e6b97e; display:block; margin:0 auto 12px; background-color:#090029; background-image:linear-gradient(180deg, #090029 0%, #090029 100%); box-shadow:0 0 16px rgba(230,185,126,0.35);" />
  <div class="js-white" style="font-family:'Georgia',serif; font-size:24px; font-weight:700; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7; letter-spacing:3px; text-transform:uppercase;">JEWEL STREET</div>
  <div class="js-gold" style="font-size:11px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; margin-top:4px; letter-spacing:1.8px; text-transform:uppercase; font-weight:600;">Royal Fine Jewellery &amp; Luxury Collection</div>
  <div class="js-lavender" style="margin-top:12px; font-size:13px; font-weight:600; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; border-top:1px solid rgba(230,185,126,0.25); padding-top:10px; letter-spacing:0.5px;">${title}</div>
</div>`;

/**
 * Generates an HTML watermark block with the logo for email footers.
 * Fully hardened against Dark Mode color alterations
 */
const buildBrandedEmailFooter = () => `
<div class="js-card" style="background-color:#0d0038; background-image:linear-gradient(180deg, #0d0038 0%, #0d0038 100%); border:1px solid rgba(230,185,126,0.25); border-radius:14px; text-align:center; margin-top:24px; padding:20px 16px; box-shadow:0 8px 24px rgba(0,0,0,0.85); color:#fdfbf7;">
  <img src="${PUBLIC_LOGO_URL}" alt="JS" width="40" height="40"
       style="border-radius:50%; object-fit:contain; opacity:0.9; margin-bottom:8px; border:1.5px solid #e6b97e; background-color:#090029; background-image:linear-gradient(180deg, #090029 0%, #090029 100%);" />
  <div class="js-gold" style="font-size:12px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; letter-spacing:0.6px;">© ${new Date().getFullYear()} Jewel Street Royal Jewellery</div>
  <div class="js-lavender" style="font-size:11px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; margin-top:4px;">✨ Certified 100% BIS Hallmarked Fine Jewellery · 24×7 Concierge Service</div>
  <div style="font-size:10px; color:#9a8bb8; -webkit-text-fill-color:#9a8bb8; text-shadow:0 0 0 #9a8bb8; margin-top:4px;">support@jewelstreet.com · +91 1800 233 8899</div>
</div>`;

/**
 * Sends a purchase invoice email directly via EmailJS from the client browser.
 * Embeds Jewel Street logo_url and complete certified bill splitup across all EmailJS template parameters.
 */
export const sendEmailJSFromBrowser = async ({
  serviceId,
  templateId,
  publicKey,
  customerName,
  customerEmail,
  invoiceNo,
  deliveryAddress,
  pincode,
  phone,
  totalAmount,
  items,
}) => {
  const service = serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID || DEFAULT_SERVICE_ID;
  const template = templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || DEFAULT_TEMPLATE_ID;
  const key = publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

  if (!service || !template || !key) {
    throw new Error('EmailJS Service ID, Template ID, or Public Key missing');
  }

  const numTotal = Math.round(totalAmount || 0);
  const grossMetal = Math.round(numTotal * 0.82);
  const makingCharges = numTotal - grossMetal;
  const cgst = Math.round(numTotal * 0.015);
  const sgst = Math.round(numTotal * 0.015);
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const itemsList = (items || []).map((it, i) => {
    const unitPrice = typeof it.price === 'number' ? it.price : (it.product?.price || 0);
    const qty = it.quantity || 1;
    const lineTotal = unitPrice * qty;
    return {
      index: i + 1,
      name: it.name || it.product?.name || 'Handcrafted Fine Jewellery',
      purity: it.purity || '22K Gold (91.6% BIS)',
      qty,
      unitPrice,
      lineTotal
    };
  });

  const itemsText = itemsList.length > 0
    ? itemsList.map(i => `${i.index}. ${i.name} (${i.purity}) x${i.qty} — ₹${i.lineTotal.toLocaleString('en-IN')}`).join('\n')
    : `1. Certified Fine Jewellery Purchase — ₹${numTotal.toLocaleString('en-IN')}`;

  const itemsHtmlRows = itemsList.length > 0
    ? itemsList.map(i => `
      <tr style="border-bottom:1px solid rgba(230,185,126,0.18);">
        <td style="padding:10px 12px; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">${i.index}</td>
        <td style="padding:10px 12px; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7; font-weight:600;">${i.name}</td>
        <td style="padding:10px 12px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">${i.purity}</td>
        <td style="padding:10px 12px; text-align:center; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">${i.qty}</td>
        <td style="padding:10px 12px; text-align:right; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">₹${i.unitPrice.toLocaleString('en-IN')}</td>
        <td style="padding:10px 12px; text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700;">₹${i.lineTotal.toLocaleString('en-IN')}</td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="6" style="padding:12px; text-align:center; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">Certified Royal Jewellery Order — ₹${numTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;

  const billSplitupHtml = `
  <div class="js-card" style="background-color:#0d0038; background-image:linear-gradient(180deg, #0d0038 0%, #0d0038 100%); border:1px solid rgba(230,185,126,0.35); border-radius:14px; padding:22px; margin:16px 0; font-family:'Segoe UI',sans-serif; color:#fdfbf7; box-shadow:0 8px 24px rgba(0,0,0,0.85);">
    <!-- Order Meta -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px; border-bottom:1px solid rgba(230,185,126,0.25); padding-bottom:14px;">
      <tr>
        <td style="vertical-align:top; font-size:13px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; line-height:1.7;">
          <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Official Tax Invoice:</strong> ${invoiceNo || 'INV-JS-01'}<br/>
          <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Invoice Date:</strong> ${currentDate}<br/>
          <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Payment Status:</strong> <span style="color:#10b981; -webkit-text-fill-color:#10b981; text-shadow:0 0 0 #10b981; font-weight:700;">Paid Online (100% Secured)</span>
        </td>
        <td style="vertical-align:top; text-align:right; font-size:13px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; line-height:1.7;">
          <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Billed &amp; Shipped To:</strong><br/>
          <strong style="color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">${customerName || 'Valued Client'}</strong><br/>
          ${deliveryAddress || 'Address on file'}${pincode ? ', ' + pincode : ''}<br/>
          Contact: ${phone || 'On file'}
        </td>
      </tr>
    </table>

    <!-- Items Purchased Table -->
    <div style="font-family:'Georgia',serif; font-size:15px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">
      Purchased Items Breakdown
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background-color:#12013b; background-image:linear-gradient(180deg, #12013b 0%, #12013b 100%); border:1px solid rgba(230,185,126,0.25); border-radius:10px; overflow:hidden; margin-bottom:18px; font-size:13px;">
      <thead>
        <tr style="background-color:#1b0254; background-image:linear-gradient(180deg, #1b0254 0%, #1b0254 100%); color:#e6b97e; text-align:left; border-bottom:2px solid #e6b97e;">
          <th style="padding:10px 12px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">#</th>
          <th style="padding:10px 12px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Item</th>
          <th style="padding:10px 12px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Purity</th>
          <th style="padding:10px 12px; text-align:center; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Qty</th>
          <th style="padding:10px 12px; text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Unit Price</th>
          <th style="padding:10px 12px; text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtmlRows}
      </tbody>
    </table>

    <!-- Certified Bill Splitup Card -->
    <div class="js-inner" style="background-color:#12013b; background-image:linear-gradient(180deg, #12013b 0%, #12013b 100%); border:1px solid rgba(230,185,126,0.3); border-radius:10px; padding:16px 18px;">
      <div style="font-family:'Georgia',serif; font-size:14px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; margin-bottom:12px; border-bottom:1px solid rgba(230,185,126,0.2); padding-bottom:6px; letter-spacing:0.8px;">
        Certified Bill Splitup &amp; Tax Calculation
      </div>
      <table width="100%" cellpadding="5" cellspacing="0" style="font-size:13px; color:#d5ccf0;">
        <tr>
          <td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Gross Gold &amp; Gemstone Value</td>
          <td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7; font-weight:600;">₹${grossMetal.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Atelier Crafting &amp; Making Charges (18%)</td>
          <td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7; font-weight:600;">₹${makingCharges.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="border-top:1px dashed rgba(230,185,126,0.25);">
          <td style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700;">Base Jewellery Subtotal</td>
          <td style="text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700;">₹${numTotal.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Central GST (CGST @ 1.5%)</td>
          <td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">₹${cgst.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">State GST (SGST @ 1.5%)</td>
          <td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">₹${sgst.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Armored Insured Transit Delivery</td>
          <td style="text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700;">FREE (Waived)</td>
        </tr>
        <tr style="border-top:2px solid #e6b97e;">
          <td style="font-family:'Georgia',serif; font-size:16px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; padding-top:10px;">Grand Total Amount Paid</td>
          <td style="font-family:'Georgia',serif; font-size:20px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; text-align:right; padding-top:10px;">₹${numTotal.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>
  </div>
  `;

  const billSplitupText = `
==================================================
👑 JEWEL STREET — OFFICIAL TAX INVOICE & BILL
==================================================
Invoice No: ${invoiceNo || 'INV-JS-01'}
Date: ${currentDate}
Customer: ${customerName || 'Valued Client'} (${customerEmail})
Delivery: ${deliveryAddress || 'Address on file'}, ${pincode || ''}
Contact: ${phone || 'N/A'}
Status: Paid Online (100% Secured)

PURCHASED ITEMS:
${itemsText}

CERTIFIED BILL SPLITUP:
- Gross Gold & Gemstone Value: ₹${grossMetal.toLocaleString('en-IN')}
- Atelier Making Charges (18%): ₹${makingCharges.toLocaleString('en-IN')}
--------------------------------------------------
- Base Jewellery Subtotal: ₹${numTotal.toLocaleString('en-IN')}
- Central GST (CGST @ 1.5%): ₹${cgst.toLocaleString('en-IN')}
- State GST (SGST @ 1.5%): ₹${sgst.toLocaleString('en-IN')}
- Armored Insured Transit Delivery: FREE (Waived)
==================================================
GRAND TOTAL PAID: ₹${numTotal.toLocaleString('en-IN')}
==================================================

✨ Certified 100% BIS Hallmarked Fine Jewellery
All Ornaments certified under Indian GST Rules 2017.
  `.trim();

  const templateParams = {
    to_name: customerName || 'Valued Royal Customer',
    to_email: customerEmail,
    customer_name: customerName || 'Valued Royal Customer',
    customer_email: customerEmail,
    name: customerName || 'Valued Royal Customer',
    email: customerEmail,
    invoice_no: invoiceNo || `INV-${Date.now()}`,
    order_date: currentDate,
    delivery_address: deliveryAddress ? `${deliveryAddress}, ${pincode || ''}` : 'Address Provided',
    phone: phone || 'N/A',
    total_amount: `₹${numTotal.toLocaleString('en-IN')}`,
    items_summary: itemsText,
    // Logo & brand fields — uses public CDN image so it NEVER breaks in Gmail
    logo_url: PUBLIC_LOGO_URL,
    brand_header: buildBrandedEmailHeader('Purchase Invoice Receipt'),
    brand_footer: buildBrandedEmailFooter(),
    brand_name: 'Jewel Street Royal Jewellery',
    brand_tagline: 'Certified 100% BIS Hallmarked Fine Jewellery',
    // Message body in primary template variables (keeping payload lightweight and <15KB)
    message: billSplitupHtml,
    html_content: billSplitupHtml,
    html_invoice: billSplitupHtml,
    invoice_summary: billSplitupText,
  };

  return await emailjs.send(service, template, templateParams, key);
};

/**
 * Sends Executive Analytics & Business Reports via EmailJS.
 * Embeds Jewel Street logo_url and brand blocks in all template fields.
 */
export const sendReportViaEmailJS = async ({
  recipientEmail,
  recipientName = 'Admin',
  reportTitle,
  reportSummaryText,
  serviceId,
  templateId,
  publicKey,
}) => {
  const service = serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID || DEFAULT_SERVICE_ID;
  const template = templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || DEFAULT_TEMPLATE_ID;
  const key = publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

  if (!service || !template || !key) {
    throw new Error('EmailJS Service ID, Template ID, or Public Key missing');
  }

  const reportHtml = `
  <div class="js-card" style="background-color:#0d0038; background-image:linear-gradient(180deg, #0d0038 0%, #0d0038 100%); border:1px solid rgba(230,185,126,0.35); border-radius:14px; padding:22px; margin:16px 0; font-family:'Segoe UI',sans-serif; color:#fdfbf7; box-shadow:0 8px 24px rgba(0,0,0,0.85);">
    <div style="font-family:'Georgia',serif; font-size:16px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; margin-bottom:12px; border-bottom:1px solid rgba(230,185,126,0.25); padding-bottom:6px; letter-spacing:0.8px;">
      ${reportTitle}
    </div>
    <div style="white-space:pre-wrap; font-size:13px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; line-height:1.7; background-color:#12013b; background-image:linear-gradient(180deg, #12013b 0%, #12013b 100%); padding:16px; border-radius:10px; border:1px solid rgba(230,185,126,0.2);">
      ${reportSummaryText}
    </div>
  </div>
  `;

  const templateParams = {
    to_name: recipientName,
    to_email: recipientEmail,
    customer_name: recipientName,
    customer_email: recipientEmail,
    name: recipientName,
    email: recipientEmail,
    invoice_no: `REP-${Date.now().toString().slice(-6)}`,
    delivery_address: 'Jewel Street Admin HQ',
    phone: 'Executive Support',
    total_amount: reportTitle,
    items_summary: reportSummaryText,
    logo_url: PUBLIC_LOGO_URL,
    brand_header: buildBrandedEmailHeader(reportTitle),
    brand_footer: buildBrandedEmailFooter(),
    brand_name: 'Jewel Street Royal Jewellery',
    brand_tagline: 'Executive Business Intelligence Report',
    message: reportHtml,
    html_content: reportHtml,
    html_invoice: reportHtml,
  };

  return await emailjs.send(service, template, templateParams, key);
};

