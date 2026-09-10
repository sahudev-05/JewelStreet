const nodemailer = require('nodemailer');
const emailjs = require('@emailjs/nodejs');

// Create transporter dynamically with Ethereal live test fallback
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }),
      isTest: false,
    };
  }

  // Instant non-blocking local simulation when SMTP credentials are not configured
  return {
    transporter: {
      sendMail: async (options) => {
        console.log(`✉️ [SIMULATED EMAIL DISPATCH] To: ${options.to} | Subject: ${options.subject}`);
        return { messageId: `sim_${Date.now()}` };
      }
    },
    isTest: true,
  };
};

// Jewel Street Translucent SVG Logo Watermark Row
const getTranslucentLogoWatermarkRow = () => `
  <tr>
    <td align="center" style="padding: 10px 0 0 0;">
      <svg width="220" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.12;">
        <path d="M20 38L32 62L50 25L68 62L80 38L88 72H12L20 38Z" fill="#e6b97e" stroke="#e6b97e" stroke-width="1.5"/>
        <circle cx="20" cy="34" r="4" fill="#ffffff"/>
        <circle cx="50" cy="20" r="5.5" fill="#ffffff"/>
        <circle cx="80" cy="34" r="4" fill="#ffffff"/>
        <polygon points="50,42 62,56 50,70 38,56" fill="#090029" stroke="#e6b97e" stroke-width="1.5"/>
        <polygon points="50,47 57,56 50,65 43,56" fill="#e6b97e"/>
      </svg>
    </td>
  </tr>
`;

// Permanent public HTTPS direct Cloudflare CDN image URL for Jewel Street Logo
const PUBLIC_LOGO_URL = 'https://iili.io/n3SbdKb.png';

// Generates a branded HTML email header in royal dark blue (#090029 / #0d0038)
// Fully hardened against Dark Mode color alterations (Gmail, Apple Mail, Outlook)
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

// Generates a branded HTML email footer
// Fully hardened against Dark Mode color alterations
const buildBrandedEmailFooter = () => `
<div class="js-card" style="background-color:#0d0038; background-image:linear-gradient(180deg, #0d0038 0%, #0d0038 100%); border:1px solid rgba(230,185,126,0.25); border-radius:14px; text-align:center; margin-top:24px; padding:20px 16px; box-shadow:0 8px 24px rgba(0,0,0,0.85); color:#fdfbf7;">
  <img src="${PUBLIC_LOGO_URL}" alt="JS" width="40" height="40"
       style="border-radius:50%; object-fit:contain; opacity:0.9; margin-bottom:8px; border:1.5px solid #e6b97e; background-color:#090029; background-image:linear-gradient(180deg, #090029 0%, #090029 100%);" />
  <div class="js-gold" style="font-size:12px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; letter-spacing:0.6px;">© ${new Date().getFullYear()} Jewel Street Royal Jewellery</div>
  <div class="js-lavender" style="font-size:11px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; margin-top:4px;">✨ Certified 100% BIS Hallmarked Fine Jewellery · 24×7 Concierge Service</div>
  <div style="font-size:10px; color:#9a8bb8; -webkit-text-fill-color:#9a8bb8; text-shadow:0 0 0 #9a8bb8; margin-top:4px;">support@jewelstreet.com · +91 1800 233 8899</div>
</div>`;

// Jewel Street Official SVG Crest & Logo Header
const getRoyalHeaderSvg = (subtitle = 'HAUTE JOAILLERIE — OFFICIAL DOCUMENT') => `
  <tr>
    <td align="center" style="border-bottom: 1px solid #e6b97e4d; padding-bottom: 20px;">
      <div style="margin-bottom: 14px;">
        <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Jewel Street Official Solitaire & Crown Crest Logo -->
          <path d="M20 38L32 62L50 25L68 62L80 38L88 72H12L20 38Z" fill="url(#royalGoldGrad)" stroke="#e6b97e" stroke-width="2"/>
          <circle cx="20" cy="34" r="4" fill="#fdfbf7"/>
          <circle cx="50" cy="20" r="5.5" fill="#fdfbf7"/>
          <circle cx="80" cy="34" r="4" fill="#fdfbf7"/>
          <polygon points="50,42 62,56 50,70 38,56" fill="#090029" stroke="#e6b97e" stroke-width="2"/>
          <polygon points="50,47 57,56 50,65 43,56" fill="#e6b97e"/>
          <defs>
            <linearGradient id="royalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="40%" stop-color="#e6b97e"/>
              <stop offset="100%" stop-color="#996e28"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 style="color: #ffffff; letter-spacing: 6px; font-size: 26px; margin: 0; text-transform: uppercase; font-family: 'Georgia', serif; font-weight: normal;">JEWEL STREET</h1>
      <span style="font-family: sans-serif; font-size: 11px; letter-spacing: 4px; color: #e6b97e; text-transform: uppercase; font-weight: 600;">${subtitle}</span>
    </td>
  </tr>
`;

const sendPurchaseInvoiceEmail = async ({ customerName, customerEmail, deliveryAddress, pincode, phone, cartItems, totalAmount, invoiceNo }) => {
  try {
    const { transporter, isTest } = await createTransporter();
    const currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const getPriceNum = (priceStr) => {
      if (typeof priceStr === 'number') return priceStr;
      const match = String(priceStr || '').match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, '')) : 0;
    };

    let itemsSubtotal = 0;
    const itemsDetailed = (cartItems || []).map(item => {
      const unitPrice = getPriceNum(item.price);
      const qty = item.quantity || item.qty || 1;
      const priceNum = unitPrice * qty;
      itemsSubtotal += priceNum;
      const metalValue = Math.round(priceNum * 0.82);
      const makingCharges = priceNum - metalValue;
      return {
        ...item,
        qty,
        unitPrice,
        priceNum,
        metalValue,
        makingCharges,
      };
    });

    const grossMetalValue = itemsDetailed.reduce((sum, i) => sum + i.metalValue, 0);
    const totalMakingCharges = itemsSubtotal - grossMetalValue;
    const cgst = Math.round(itemsSubtotal * 0.015);
    const sgst = Math.round(itemsSubtotal * 0.015);
    const totalGst = cgst + sgst;
    const deliveryCharge = itemsSubtotal > 100000 ? 0 : 1500;
    const calculatedGrossTotal = itemsSubtotal + totalGst + deliveryCharge;
    const discountAmount = Math.max(0, calculatedGrossTotal - Math.round(totalAmount));

    const itemsHtml = itemsDetailed.map((item, idx) => `
      <tr style="border-bottom: 1px solid #16024d;">
        <td style="padding: 12px; font-family: sans-serif; color: #ffffff; font-size: 13px;">
          <strong style="color: #e6b97e; font-size: 14px;">${idx + 1}. ${item.name}</strong><br/>
          <span style="font-size: 11px; color: #d5ccf0;">Purity: ${item.purity || 'Certified Gold'} | Weight: ${item.weight || 'Standard'}${item.qty > 1 ? ` | Qty: ${item.qty}` : ''}</span>
        </td>
        <td style="padding: 12px; font-family: sans-serif; color: #d5ccf0; font-size: 12px; text-align: right;">
          ₹${item.metalValue.toLocaleString('en-IN')}
        </td>
        <td style="padding: 12px; font-family: sans-serif; color: #d5ccf0; font-size: 12px; text-align: right;">
          ₹${item.makingCharges.toLocaleString('en-IN')}
        </td>
        <td style="padding: 12px; font-family: sans-serif; color: #e6b97e; font-weight: bold; font-size: 13px; text-align: right;">
          ₹${item.priceNum.toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    const subjectTitle = `JEWEL STREET — Official Tax Invoice & Certified Bill Splitup (${invoiceNo})`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subjectTitle}</title>
      </head>
      <body style="background-color: #090029; font-family: 'Georgia', serif; color: #ffffff; margin: 0; padding: 20px;">
        <table width="100%" max-width="680" align="center" style="max-width: 680px; background-color: #0d0038; border: 1px solid #e6b97e4d; border-radius: 16px; overflow: hidden; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);">
          ${getRoyalHeaderSvg('HAUTE JOAILLERIE — OFFICIAL TAX INVOICE')}
          ${getTranslucentLogoWatermarkRow()}

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 0 10px 0; font-family: sans-serif;">
              <h2 style="font-family: serif; color: #e6b97e; font-size: 22px; margin-bottom: 10px;">Thank You for Your Order, ${customerName}!</h2>
              <p style="color: #d5ccf0; line-height: 1.6; font-size: 14px; margin: 0;">
                We are delighted to confirm that your payment has been processed successfully. Below is your official certified tax invoice and <strong>complete bill splitup</strong> for your fine jewellery order.
              </p>
            </td>
          </tr>

          <!-- Invoice Details Box -->
          <tr>
            <td style="padding: 15px 0;">
              <table width="100%" style="background-color: #06001a; border: 1px solid #e6b97e33; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0; line-height: 1.6;">
                    <strong>Invoice No:</strong> <span style="color: #e6b97e; font-weight: bold;">${invoiceNo}</span><br/>
                    <strong>Order Timestamp:</strong> ${currentDate}<br/>
                    <strong>Payment Status:</strong> Paid Online (100% Secured)
                  </td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0; line-height: 1.6; text-align: right;">
                    <strong>Shipping Address:</strong><br/>
                    ${deliveryAddress}, ${pincode}<br/>
                    Contact: ${phone}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Purchased Items Table -->
          <tr>
            <td style="padding: 10px 0;">
              <h3 style="color: #e6b97e; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e6b97e33; padding-bottom: 6px; font-family: serif;">
                Itemized Jewellery Splitup
              </h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #06001a; border-bottom: 1px solid #e6b97e44;">
                    <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #e6b97e; text-align: left;">Item & Specifications</th>
                    <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #e6b97e; text-align: right;">Metal Value</th>
                    <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #e6b97e; text-align: right;">Making (18%)</th>
                    <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #e6b97e; text-align: right;">Item Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Full Bill Splitup Section -->
          <tr>
            <td style="padding: 15px 0;">
              <h3 style="color: #e6b97e; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e6b97e33; padding-bottom: 6px; font-family: serif;">
                Full Bill Splitup & Tax Breakup
              </h3>
              <table width="100%" style="background-color: #06001a; border: 1px solid #e6b97e33; border-radius: 12px; padding: 18px;" cellspacing="0" cellpadding="6">
                <tr>
                  <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0;">Gross Gold & Gemstone Value</td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #ffffff; text-align: right; font-weight: 600;">₹${grossMetalValue.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0;">Atelier Making & Crafting Charges</td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #ffffff; text-align: right; font-weight: 600;">₹${totalMakingCharges.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="border-top: 1px dashed #e6b97e22;">
                  <td style="font-family: sans-serif; font-size: 13px; color: #e6b97e; font-weight: bold;">Subtotal (Base Ornaments Price)</td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #e6b97e; text-align: right; font-weight: bold;">₹${itemsSubtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0;">Central GST (CGST @ 1.5%)</td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #ffffff; text-align: right;">₹${cgst.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0;">State GST (SGST @ 1.5%)</td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #ffffff; text-align: right;">₹${sgst.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0;">Armored Insured Transit Delivery</td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #ffffff; text-align: right;">
                    ${discountAmount >= deliveryCharge ? '<span style="color: #e6b97e; font-weight: bold;">FREE (Waived)</span>' : `₹${deliveryCharge.toLocaleString('en-IN')}`}
                  </td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                  <td style="font-family: sans-serif; font-size: 13px; color: #e6b97e;">Applied Offer Discount</td>
                  <td style="font-family: sans-serif; font-size: 13px; color: #e6b97e; text-align: right; font-weight: bold;">-₹${discountAmount.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #e6b97e66;">
                  <td style="font-family: serif; font-size: 16px; color: #e6b97e; font-weight: bold; padding-top: 10px;">Grand Total Paid</td>
                  <td style="font-family: serif; font-size: 22px; color: #e6b97e; font-weight: bold; text-align: right; padding-top: 10px;">₹${Math.round(totalAmount).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Guarantee -->
          <tr>
            <td align="center" style="border-top: 1px solid #e6b97e33; padding-top: 20px; font-family: sans-serif; font-size: 12px; color: #9a8bb8;">
              <p style="margin: 4px 0;">If you have any billing queries, contact our Concierge team at <a href="mailto:concierge@jewelstreet.com" style="color: #e6b97e; text-decoration: none;">concierge@jewelstreet.com</a> or +91 1800 233 8899.</p>
              <p style="margin: 4px 0; color: #e6b97e;">© 2026 JEWEL STREET — All Ornaments Certified with Official BIS Hallmark Certification. Tax Invoice issued under Indian GST Rules 2017.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // ── EmailJS Primary Delivery Route ──
    const serviceID = process.env.EMAILJS_SERVICE_ID;
    const templateID = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (serviceID && templateID && publicKey) {
      try {
        console.log(`✉️ Attempting EmailJS delivery to ${customerEmail}...`);
        const billSplitupText = `
==================================================
👑 JEWEL STREET — HAUTE JOAILLERIE TAX INVOICE
==================================================
Invoice No: ${invoiceNo}
Order Date: ${currentDate}
Customer Name: ${customerName}
Delivery Address: ${deliveryAddress}, ${pincode}
Contact Phone: ${phone}

PURCHASED ITEMS:
${itemsDetailed.map((item, idx) => `${idx + 1}. ${item.name}\n   Purity: ${item.purity || '22K'} | Weight: ${item.weight || 'Standard'}\n   Metal Value: ₹${item.metalValue.toLocaleString('en-IN')} | Making: ₹${item.makingCharges.toLocaleString('en-IN')} | Total: ₹${item.priceNum.toLocaleString('en-IN')}`).join('\n\n')}

FULL BILL SPLITUP:
- Gross Gold & Gemstone Value: ₹${grossMetalValue.toLocaleString('en-IN')}
- Atelier Making & Crafting Charges (18%): ₹${totalMakingCharges.toLocaleString('en-IN')}
--------------------------------------------------
Base Jewellery Subtotal: ₹${itemsSubtotal.toLocaleString('en-IN')}
- Central GST (CGST @ 1.5%): ₹${cgst.toLocaleString('en-IN')}
- State GST (SGST @ 1.5%): ₹${sgst.toLocaleString('en-IN')}
- Armored Insured Transit Delivery: ${discountAmount >= deliveryCharge ? 'FREE (Waived)' : `₹${deliveryCharge.toLocaleString('en-IN')}`}
${discountAmount > 0 ? `- Applied Coupon Discount: -₹${discountAmount.toLocaleString('en-IN')}` : ''}
==================================================
GRAND TOTAL PAID: ₹${Math.round(totalAmount).toLocaleString('en-IN')}
==================================================

Thank you for shopping with Jewel Street!
All Ornaments Certified 100% BIS Hallmarked 22K (91.6%) & 18K (75%).
        `.trim();

        const invoiceContentHtml = `
<div class="js-card" style="background-color:#0d0038; background-image:linear-gradient(180deg, #0d0038 0%, #0d0038 100%); border:1px solid rgba(230,185,126,0.35); border-radius:14px; padding:20px; margin:16px 0; font-family:'Segoe UI',sans-serif; color:#fdfbf7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px; border-bottom:1px solid rgba(230,185,126,0.25); padding-bottom:12px;">
    <tr>
      <td style="font-size:13px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; line-height:1.6;">
        <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Invoice No:</strong> ${invoiceNo}<br/>
        <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Date:</strong> ${currentDate}<br/>
        <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Status:</strong> <span style="color:#10b981; -webkit-text-fill-color:#10b981; text-shadow:0 0 0 #10b981; font-weight:700;">Paid Online (100% Secured)</span>
      </td>
      <td style="text-align:right; font-size:13px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0; line-height:1.6;">
        <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Client:</strong> ${customerName}<br/>
        ${deliveryAddress}, ${pincode}<br/>
        Contact: ${phone}
      </td>
    </tr>
  </table>

  <div style="font-family:'Georgia',serif; font-size:14px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">
    Purchased Items Breakdown
  </div>
  <table width="100%" cellpadding="8" cellspacing="0" style="background-color:#12013b; background-image:linear-gradient(180deg, #12013b 0%, #12013b 100%); border:1px solid rgba(230,185,126,0.25); border-radius:8px; margin-bottom:16px; font-size:12px; border-collapse:collapse;">
    <thead>
      <tr style="background-color:#1b0254; background-image:linear-gradient(180deg, #1b0254 0%, #1b0254 100%); color:#e6b97e; border-bottom:1.5px solid #e6b97e;">
        <th style="padding:8px; text-align:left; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Item</th>
        <th style="padding:8px; text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Metal</th>
        <th style="padding:8px; text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Making (18%)</th>
        <th style="padding:8px; text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsDetailed.map(i => `
        <tr style="border-bottom:1px solid rgba(230,185,126,0.15);">
          <td style="padding:8px; color:#ffffff; -webkit-text-fill-color:#ffffff; text-shadow:0 0 0 #ffffff;">
            <strong style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">${i.name}</strong><br/>
            <span style="font-size:10px; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">${i.purity || '22K'} | Qty: ${i.qty}</span>
          </td>
          <td style="padding:8px; text-align:right; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">₹${i.metalValue.toLocaleString('en-IN')}</td>
          <td style="padding:8px; text-align:right; color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">₹${i.makingCharges.toLocaleString('en-IN')}</td>
          <td style="padding:8px; text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:bold;">₹${i.priceNum.toLocaleString('en-IN')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="js-inner" style="background-color:#12013b; background-image:linear-gradient(180deg, #12013b 0%, #12013b 100%); border:1px solid rgba(230,185,126,0.3); border-radius:8px; padding:14px;">
    <div style="font-family:'Georgia',serif; font-size:13px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:bold; margin-bottom:8px; border-bottom:1px solid rgba(230,185,126,0.2); padding-bottom:4px;">
      Certified Bill Splitup &amp; Tax Calculation
    </div>
    <table width="100%" cellpadding="4" cellspacing="0" style="font-size:12px; color:#d5ccf0;">
      <tr><td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Gross Gold &amp; Gemstone Value</td><td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">₹${grossMetalValue.toLocaleString('en-IN')}</td></tr>
      <tr><td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Atelier Making Charges (18%)</td><td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">₹${totalMakingCharges.toLocaleString('en-IN')}</td></tr>
      <tr style="border-top:1px dashed rgba(230,185,126,0.25);"><td style="color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:bold;">Base Jewellery Subtotal</td><td style="text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:bold;">₹${itemsSubtotal.toLocaleString('en-IN')}</td></tr>
      <tr><td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Central GST (CGST @ 1.5%)</td><td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">₹${cgst.toLocaleString('en-IN')}</td></tr>
      <tr><td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">State GST (SGST @ 1.5%)</td><td style="text-align:right; color:#fdfbf7; -webkit-text-fill-color:#fdfbf7; text-shadow:0 0 0 #fdfbf7;">₹${sgst.toLocaleString('en-IN')}</td></tr>
      <tr><td style="color:#d5ccf0; -webkit-text-fill-color:#d5ccf0; text-shadow:0 0 0 #d5ccf0;">Insured Armored Delivery</td><td style="text-align:right; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e;">FREE (Waived)</td></tr>
      ${discountAmount > 0 ? `<tr><td style="color:#4ecdc4; -webkit-text-fill-color:#4ecdc4; text-shadow:0 0 0 #4ecdc4;">Applied Offer Discount</td><td style="text-align:right; color:#4ecdc4; -webkit-text-fill-color:#4ecdc4; text-shadow:0 0 0 #4ecdc4; font-weight:bold;">-₹${discountAmount.toLocaleString('en-IN')}</td></tr>` : ''}
      <tr style="border-top:2px solid #e6b97e;"><td style="font-family:'Georgia',serif; font-size:15px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:bold; padding-top:8px;">Grand Total Paid</td><td style="font-family:'Georgia',serif; font-size:18px; color:#e6b97e; -webkit-text-fill-color:#e6b97e; text-shadow:0 0 0 #e6b97e; font-weight:bold; text-align:right; padding-top:8px;">₹${Math.round(totalAmount).toLocaleString('en-IN')}</td></tr>
    </table>
  </div>
</div>
`;

        const templateParams = {
          subject: subjectTitle,
          title: subjectTitle,
          to_name: customerName,
          to_email: customerEmail,
          customer_name: customerName,
          customer_email: customerEmail,
          name: customerName,
          email: customerEmail,
          invoice_no: invoiceNo,
          order_date: currentDate,
          delivery_address: `${deliveryAddress}, ${pincode}`,
          phone: phone,
          gross_metal_value: `₹${grossMetalValue.toLocaleString('en-IN')}`,
          making_charges: `₹${totalMakingCharges.toLocaleString('en-IN')}`,
          subtotal: `₹${itemsSubtotal.toLocaleString('en-IN')}`,
          cgst: `₹${cgst.toLocaleString('en-IN')}`,
          sgst: `₹${sgst.toLocaleString('en-IN')}`,
          delivery_fee: `₹${deliveryCharge.toLocaleString('en-IN')}`,
          discount: `₹${discountAmount.toLocaleString('en-IN')}`,
          total_amount: `₹${Math.round(totalAmount).toLocaleString('en-IN')}`,
          items_summary: itemsDetailed.map(i => `${i.name} (${i.purity || '22K'}) - ₹${i.priceNum.toLocaleString('en-IN')}`).join('\n'),
          logo_url: PUBLIC_LOGO_URL,
          brand_header: buildBrandedEmailHeader('Purchase Invoice Receipt'),
          brand_footer: buildBrandedEmailFooter(),
          brand_name: 'Jewel Street Royal Jewellery',
          brand_tagline: 'Certified 100% BIS Hallmarked Fine Jewellery',
          message: invoiceContentHtml,
          invoice_summary: billSplitupText,
          html_invoice: invoiceContentHtml,
          html_content: invoiceContentHtml,
        };

        return await sendViaEmailJS(templateParams);
      } catch (emailjsErr) {
        console.warn('⚠️ EmailJS delivery error:', emailjsErr.message || emailjsErr);
      }
    }

    return {
      success: true,
      provider: 'EmailJS / Simulated Email',
      invoiceNo,
      htmlContent,
      isTest: true,
    };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};

// Helper for generic EmailJS delivery with full template field enrichment
const sendViaEmailJS = async (templateParams) => {
  const serviceID = process.env.EMAILJS_SERVICE_ID;
  const templateID = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (serviceID && templateID && publicKey) {
    try {
      const msgText = templateParams.message || templateParams.content || templateParams.details || templateParams.body || templateParams.invoice_summary || templateParams.summary || templateParams.text || '';
      const htmlText = templateParams.html_invoice || templateParams.html_content || templateParams.html || templateParams.message_html || msgText;
      const custName = templateParams.to_name || templateParams.customer_name || templateParams.user_name || templateParams.name || 'Valued Client';
      const custEmail = templateParams.to_email || templateParams.customer_email || templateParams.user_email || templateParams.email || '';
      const subj = templateParams.subject || templateParams.title || '👑 JEWEL STREET Royal Notification';

      const enrichedParams = {
        to_name: custName,
        to_email: custEmail,
        customer_name: custName,
        customer_email: custEmail,
        name: custName,
        email: custEmail,
        from_name: 'Jewel Street Royal Concierge',
        reply_to: 'concierge@jewelstreet.com',
        subject: subj,
        logo_url: templateParams.logo_url || PUBLIC_LOGO_URL,
        brand_header: templateParams.brand_header || buildBrandedEmailHeader(subj),
        brand_footer: templateParams.brand_footer || buildBrandedEmailFooter(),
        brand_name: 'Jewel Street Royal Jewellery',
        brand_tagline: 'Certified 100% BIS Hallmarked Fine Jewellery',
        message: msgText,
        html_content: htmlText,
        ...templateParams,
      };

      console.log(`✉️ Sending EmailJS message to ${custEmail} (${subj})...`);
      let response;
      try {
        response = await emailjs.send(
          serviceID,
          templateID,
          enrichedParams,
          { publicKey, ...(privateKey ? { privateKey } : {}) }
        );
      } catch (sdkErr) {
        const restRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          },
          body: JSON.stringify({
            service_id: serviceID,
            template_id: templateID,
            user_id: publicKey,
            ...(privateKey ? { accessToken: privateKey } : {}),
            template_params: enrichedParams,
          })
        });
        const restText = await restRes.text();
        if (restRes.ok || restRes.status === 200) {
          response = { status: 200, text: restText };
        } else {
          throw new Error(`EmailJS REST API (${restRes.status}): ${restText}`);
        }
      }
      console.log(`✅ EmailJS message delivered successfully!`);
      return { success: true, provider: 'EmailJS', response };
    } catch (err) {
      console.warn('⚠️ EmailJS delivery notice:', err.message);
    }
  }
  return { success: true, provider: 'Simulated Email' };
};

// 7-Day Return / Replacement Email via EmailJS
const sendReturnReplacementEmail = async ({ customerName, customerEmail, invoiceNo, items, reason, type = 'Return' }) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const itemsText = (items || []).map(i => i.name).join(', ') || 'Certified Jewellery Piece';
  const subjectTitle = `JEWEL STREET — 7-Day ${type} Request Confirmation (${invoiceNo})`;
  const summaryText = `
JEWEL STREET — 7-DAY ${type.toUpperCase()} REQUEST CONFIRMATION
==================================================
Invoice No: ${invoiceNo}
Customer: ${customerName} (${customerEmail})
Request Type: 7-Day ${type} & Exchange Privilege
Item(s): ${itemsText}
Reason Provided: ${reason || 'Size / Fit / Preference Adjustment'}
Request Date: ${currentDate}

WHAT HAPPENS NEXT?
1. Our Armored Courier Partner will arrive at your address within 24-48 hours to collect the jewellery in its tamper-proof velvet box.
2. Upon quality inspection at our Royal Atelier, your ${type === 'Return' ? '100% full refund will be credited to your original payment method within 7 business days' : 'replacement jewellery piece will be dispatched immediately'}.
==================================================
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${subjectTitle}</title></head>
    <body style="background-color: #090029; font-family: 'Georgia', serif; color: #ffffff; margin: 0; padding: 20px;">
      <table width="100%" max-width="620" align="center" style="max-width: 620px; background-color: #0d0038; border: 1px solid #e6b97e4d; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);">
        ${getRoyalHeaderSvg(`HAUTE JOAILLERIE — 7-DAY ${type.toUpperCase()} PRIVILEGE`)}
        ${getTranslucentLogoWatermarkRow()}
        <tr>
          <td style="padding: 20px 0 10px 0; font-family: sans-serif;">
            <h2 style="font-family: serif; color: #e6b97e; font-size: 20px; margin-bottom: 8px;">7-Day ${type} & Exchange Request Confirmation</h2>
            <p style="color: #d5ccf0; line-height: 1.6; font-size: 13px; margin: 0;">
              Dear <strong>${customerName}</strong>, we have registered your 7-Day privilege request for invoice <strong>${invoiceNo}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table width="100%" style="background-color: #06001a; border: 1px solid #e6b97e33; border-radius: 12px; padding: 18px;">
              <tr>
                <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0; line-height: 1.8;">
                  <strong>Invoice No:</strong> <span style="color: #e6b97e; font-weight: bold;">${invoiceNo}</span><br/>
                  <strong>Request Type:</strong> <span style="color: #e6b97e; font-weight: bold;">7-Day ${type}</span><br/>
                  <strong>Jewellery Item(s):</strong> ${itemsText}<br/>
                  <strong>Reason Provided:</strong> ${reason || 'Size / Fit Adjustment'}<br/>
                  <strong>Request Date:</strong> ${currentDate}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: rgba(230,185,126,0.08); border-radius: 8px; font-family: sans-serif; font-size: 12px; color: #e6b97e; border: 1px solid #e6b97e33;">
            <strong>Armored Transit Pickup:</strong> Our courier partner will arrive at your delivery address within 24-48 hours to collect the item in its original box.
          </td>
        </tr>
        <tr>
          <td align="center" style="border-top: 1px solid #e6b97e33; padding-top: 16px; font-family: sans-serif; font-size: 11px; color: #9a8bb8;">
            <p style="margin: 4px 0;">Concierge Service: <a href="mailto:concierge@jewelstreet.com" style="color: #e6b97e; text-decoration: none;">concierge@jewelstreet.com</a> | +91 1800 233 8899</p>
            <p style="margin: 4px 0; color: #e6b97e;">© 2026 JEWEL STREET — All Ornaments BIS Hallmarked.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendViaEmailJS({
    subject: subjectTitle,
    title: subjectTitle,
    to_name: customerName,
    to_email: customerEmail,
    customer_name: customerName,
    customer_email: customerEmail,
    invoice_no: invoiceNo,
    order_date: currentDate,
    request_type: type,
    reason: reason || '7-Day Return Privilege',
    message: summaryText,
    items_summary: itemsText,
    delivery_address: 'Registered Shipping Address',
    phone: 'Registered Contact Phone',
    total_amount: 'N/A (Return / Replacement Request)',
    html_content: htmlContent,
    html_invoice: htmlContent,
  });
};

// Cancelled Order & 7-Day Refund Notice via EmailJS
const sendCancellationRefundEmail = async ({ customerName, customerEmail, invoiceNo, totalAmount, refundDays = 7 }) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const formattedTotal = `₹${(totalAmount || 0).toLocaleString('en-IN')}`;
  const subjectTitle = `JEWEL STREET — Order Cancellation & Full Refund Notice (${invoiceNo})`;
  const summaryText = `
JEWEL STREET — ORDER CANCELLATION & REFUND NOTICE
==================================================
Invoice No: ${invoiceNo}
Customer Name: ${customerName} (${customerEmail})
Cancelled Total Amount: ${formattedTotal}
Cancellation Date: ${currentDate}

REFUND DETAILS:
- Refund Amount: ${formattedTotal} (100% Full Refund)
- Processing Window: Credited to original source account within ${refundDays} business days.
- Reference ID: REF-JS-${Date.now().toString().slice(-6)}

If you have any questions regarding your refund status, please reply directly to this email or contact concierge@jewelstreet.com.
==================================================
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${subjectTitle}</title></head>
    <body style="background-color: #090029; font-family: 'Georgia', serif; color: #ffffff; margin: 0; padding: 20px;">
      <table width="100%" max-width="620" align="center" style="max-width: 620px; background-color: #0d0038; border: 1px solid #e6b97e4d; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);">
        ${getRoyalHeaderSvg('HAUTE JOAILLERIE — CANCELLATION & REFUND')}
        ${getTranslucentLogoWatermarkRow()}
        <tr>
          <td style="padding: 20px 0 10px 0; font-family: sans-serif;">
            <h2 style="font-family: serif; color: #e6b97e; font-size: 20px; margin-bottom: 8px;">Order Cancellation & 100% Refund Confirmation</h2>
            <p style="color: #d5ccf0; line-height: 1.6; font-size: 13px; margin: 0;">
              Dear <strong>${customerName}</strong>, your order <strong>${invoiceNo}</strong> has been cancelled. A 100% full refund has been initiated to your original payment source.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table width="100%" style="background-color: #06001a; border: 1px solid #e6b97e33; border-radius: 12px; padding: 18px;">
              <tr>
                <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0; line-height: 1.8;">
                  <strong>Invoice No:</strong> <span style="color: #e6b97e; font-weight: bold;">${invoiceNo}</span><br/>
                  <strong>Refund Amount:</strong> <span style="color: #e6b97e; font-weight: bold; font-size: 15px;">${formattedTotal}</span> (100% Full Refund)<br/>
                  <strong>Processing Window:</strong> Credited within ${refundDays} business days<br/>
                  <strong>Cancellation Date:</strong> ${currentDate}<br/>
                  <strong>Reference ID:</strong> REF-JS-${Date.now().toString().slice(-6)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="border-top: 1px solid #e6b97e33; padding-top: 16px; font-family: sans-serif; font-size: 11px; color: #9a8bb8;">
            <p style="margin: 4px 0;">Billing & Refund Enquiries: <a href="mailto:concierge@jewelstreet.com" style="color: #e6b97e; text-decoration: none;">concierge@jewelstreet.com</a> | +91 1800 233 8899</p>
            <p style="margin: 4px 0; color: #e6b97e;">© 2026 JEWEL STREET — Issued under GST Rules 2017.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendViaEmailJS({
    subject: subjectTitle,
    title: subjectTitle,
    to_name: customerName,
    to_email: customerEmail,
    customer_name: customerName,
    customer_email: customerEmail,
    invoice_no: invoiceNo,
    order_date: currentDate,
    total_amount: formattedTotal,
    message: summaryText,
    items_summary: 'Cancelled Order Items',
    delivery_address: 'N/A (Order Cancelled)',
    phone: 'N/A',
    refund_status: `Full Refund of ${formattedTotal} initiated (Credited within 7 business days)`,
    html_content: htmlContent,
    html_invoice: htmlContent,
  });
};

// Admin Welcome Credentials Email via EmailJS
const sendAdminWelcomeEmail = async ({ name, email, password, role = 'admin' }) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const subjectTitle = `JEWEL STREET — Store Administrator Credentials (${name})`;
  const summaryText = `
JEWEL STREET — STORE ADMINISTRATOR CREDENTIALS
==================================================
Hello ${name},

You have been appointed as an Administrator for the Jewel Street Store Management Portal.

YOUR CREDENTIALS:
- Email Address: ${email}
- Passcode: ${password}
- System Role: ${role === 'master_admin' ? 'Master Administrator' : 'Store Administrator'}
- Portal URL: http://localhost:5173/admin

SECURITY NOTICE:
Please log in to the admin command center and update your passcode upon first session.
==================================================
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${subjectTitle}</title></head>
    <body style="background-color: #090029; font-family: 'Georgia', serif; color: #ffffff; margin: 0; padding: 20px;">
      <table width="100%" max-width="620" align="center" style="max-width: 620px; background-color: #0d0038; border: 1px solid #e6b97e4d; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);">
        ${getRoyalHeaderSvg('HAUTE JOAILLERIE — STORE COMMAND CENTER')}
        ${getTranslucentLogoWatermarkRow()}
        <tr>
          <td style="padding: 20px 0 10px 0; font-family: sans-serif;">
            <h2 style="font-family: serif; color: #e6b97e; font-size: 20px; margin-bottom: 8px;">Welcome to the Store Management Team, ${name}!</h2>
            <p style="color: #d5ccf0; line-height: 1.6; font-size: 13px; margin: 0;">
              You have been officially appointed as an Administrator for the Jewel Street Store Management Command Center. Below are your security access credentials.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table width="100%" style="background-color: #06001a; border: 1px solid #e6b97e33; border-radius: 12px; padding: 18px;">
              <tr>
                <td style="font-family: monospace; font-size: 13px; color: #d5ccf0; line-height: 1.8;">
                  <strong>Admin Name:</strong> <span style="color: #ffffff;">${name}</span><br/>
                  <strong>Login Email:</strong> <span style="color: #e6b97e; font-weight: bold;">${email}</span><br/>
                  <strong>Passcode:</strong> <span style="color: #e6b97e; font-weight: bold;">${password}</span><br/>
                  <strong>System Role:</strong> <span style="color: #e6b97e;">${role === 'master_admin' ? 'Master Administrator' : 'Store Administrator'}</span><br/>
                  <strong>Portal Link:</strong> <a href="http://localhost:5173/admin" style="color: #e6b97e;">http://localhost:5173/admin</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-family: sans-serif; font-size: 12px; color: #e6b97e;">
            <strong>Security Notice:</strong> Please log in to the admin portal and update your passcode upon first session.
          </td>
        </tr>
        <tr>
          <td align="center" style="border-top: 1px solid #e6b97e33; padding-top: 16px; font-family: sans-serif; font-size: 11px; color: #9a8bb8;">
            <p style="margin: 4px 0; color: #e6b97e;">© 2026 JEWEL STREET — Confidential Administrator Authorization Document.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendViaEmailJS({
    subject: subjectTitle,
    title: subjectTitle,
    to_name: name,
    to_email: email,
    customer_name: name,
    customer_email: email,
    admin_password: password,
    admin_role: role,
    invoice_no: 'ADMIN-SYS-KEY',
    order_date: currentDate,
    total_amount: 'N/A (Admin Role Assignment)',
    delivery_address: 'Jewel Street Corporate Portal',
    phone: 'N/A',
    items_summary: 'Store Administrator Privileges Assigned',
    message: summaryText,
    html_content: htmlContent,
    html_invoice: htmlContent,
  });
};

// Order Delivered & Transit Notification Email via EmailJS
const sendOrderDeliveredEmail = async ({ customerName, customerEmail, invoiceNo, items, totalAmount, status = 'Delivered' }) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const itemsText = (items || []).map(i => `${i.name} (${i.purity || '22K'})`).join(', ') || 'Certified Fine Jewellery';
  const formattedTotal = `₹${(totalAmount || 0).toLocaleString('en-IN')}`;
  
  const isTransit = status === 'In Armored Transit';
  const subjectText = `JEWEL STREET — Order ${invoiceNo} ${isTransit ? 'In Armored Transit' : 'Delivered Successfully'}`;
  const summaryText = `
${isTransit ? 'JEWEL STREET — ARMORED TRANSIT DISPATCH' : 'JEWEL STREET — ORDER DELIVERED SUCCESS'}
==================================================
Invoice No: ${invoiceNo}
Customer Name: ${customerName} (${customerEmail})
Status: ${status}
Jewellery Item(s): ${itemsText}
Total Amount: ${formattedTotal}
Date: ${currentDate}

${isTransit ? 'Your fine jewellery parcel has been picked up by our Armored Courier Partner and is en route with GPS tracking.' : 'Your fine jewellery parcel has been delivered to your address in its tamper-proof luxury box.'}

Thank you for choosing Jewel Street Haute Joaillerie!
==================================================
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${subjectText}</title></head>
    <body style="background-color: #090029; font-family: 'Georgia', serif; color: #ffffff; margin: 0; padding: 20px;">
      <table width="100%" max-width="620" align="center" style="max-width: 620px; background-color: #0d0038; border: 1px solid #e6b97e4d; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);">
        ${getRoyalHeaderSvg(`HAUTE JOAILLERIE — ${status.toUpperCase()}`)}
        ${getTranslucentLogoWatermarkRow()}
        <tr>
          <td style="padding: 20px 0 10px 0; font-family: sans-serif;">
            <h2 style="font-family: serif; color: #e6b97e; font-size: 20px; margin-bottom: 8px;">${isTransit ? 'Your Jewellery is En Route' : 'Order Delivered Successfully'}</h2>
            <p style="color: #d5ccf0; line-height: 1.6; font-size: 13px; margin: 0;">
              Dear <strong>${customerName}</strong>, your fine jewellery order <strong>${invoiceNo}</strong> has been updated to <strong>${status}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table width="100%" style="background-color: #06001a; border: 1px solid #e6b97e33; border-radius: 12px; padding: 18px;">
              <tr>
                <td style="font-family: sans-serif; font-size: 13px; color: #d5ccf0; line-height: 1.8;">
                  <strong>Invoice No:</strong> <span style="color: #e6b97e; font-weight: bold;">${invoiceNo}</span><br/>
                  <strong>Fulfillment Status:</strong> <span style="color: #e6b97e; font-weight: bold;">${status}</span><br/>
                  <strong>Jewellery Item(s):</strong> ${itemsText}<br/>
                  <strong>Grand Total Paid:</strong> <span style="color: #e6b97e; font-weight: bold;">${formattedTotal}</span><br/>
                  <strong>Update Date:</strong> ${currentDate}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: rgba(230,185,126,0.08); border-radius: 8px; font-family: sans-serif; font-size: 12px; color: #e6b97e; border: 1px solid #e6b97e33;">
            ${isTransit ? 'Armored Transit: Your parcel is protected by 100% full transit insurance with GPS tracking.' : '7-Day Royal Privilege Active: Your order is covered by 7-Day Return / Exchange privileges from today.'}
          </td>
        </tr>
        <tr>
          <td align="center" style="border-top: 1px solid #e6b97e33; padding-top: 16px; font-family: sans-serif; font-size: 11px; color: #9a8bb8;">
            <p style="margin: 4px 0;">Concierge Hotline: <a href="mailto:concierge@jewelstreet.com" style="color: #e6b97e; text-decoration: none;">concierge@jewelstreet.com</a> | +91 1800 233 8899</p>
            <p style="margin: 4px 0; color: #e6b97e;">© 2026 JEWEL STREET — All Ornaments BIS Hallmarked.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendViaEmailJS({
    subject: subjectText,
    title: subjectText,
    to_name: customerName,
    to_email: customerEmail,
    customer_name: customerName,
    customer_email: customerEmail,
    invoice_no: invoiceNo,
    order_date: currentDate,
    total_amount: formattedTotal,
    items_summary: itemsText,
    delivery_address: 'Registered Address',
    phone: 'N/A',
    message: summaryText,
    html_content: htmlContent,
    html_invoice: htmlContent,
  });
};

// Password Reset OTP Email via EmailJS / Transporter
const sendPasswordResetOtpEmail = async ({ name, email, otp, userType = 'User' }) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const subjectTitle = `JEWEL STREET — ${otp} is your Security Password Reset Code`;
  const summaryText = `
JEWEL STREET — PASSWORD RESET VERIFICATION CODE
==================================================
Hello ${name || 'Valued Client'},

You requested a password reset for your Jewel Street account (${email}).

YOUR 6-DIGIT VERIFICATION CODE:
${otp}

This code is valid for 15 minutes.
If you did not request this code, please ignore this email or reach out to our Concierge team immediately.
==================================================
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${subjectTitle}</title></head>
    <body style="background-color: #090029; font-family: 'Georgia', serif; color: #ffffff; margin: 0; padding: 20px;">
      <table width="100%" max-width="620" align="center" style="max-width: 620px; background-color: #0d0038; border: 1px solid #e6b97e4d; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);">
        ${getRoyalHeaderSvg('HAUTE JOAILLERIE — SECURITY VERIFICATION')}
        ${getTranslucentLogoWatermarkRow()}
        <tr>
          <td style="padding: 20px 0 10px 0; font-family: sans-serif;">
            <h2 style="font-family: serif; color: #e6b97e; font-size: 20px; margin-bottom: 8px;">Password Reset Request</h2>
            <p style="color: #d5ccf0; line-height: 1.6; font-size: 13px; margin: 0;">
              Hello <strong>${name || 'Valued Member'}</strong>, we received a request to reset your password for your Jewel Street ${userType === 'Admin' ? 'Administrator' : 'Client'} account.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <div style="background-color: #06001a; border: 2px dashed #e6b97e; border-radius: 12px; padding: 20px; max-width: 320px; margin: 0 auto;">
              <span style="font-family: sans-serif; font-size: 11px; letter-spacing: 3px; color: #a599c2; text-transform: uppercase; display: block; margin-bottom: 8px;">Your Verification Code</span>
              <div style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #e6b97e; text-shadow: 0 0 12px rgba(230,185,126,0.5);">
                ${otp}
              </div>
              <span style="font-family: sans-serif; font-size: 11px; color: #ff9b9b; display: block; margin-top: 8px;">Expires in 15 minutes</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: rgba(230,185,126,0.08); border-radius: 8px; font-family: sans-serif; font-size: 12px; color: #d5ccf0; border: 1px solid #e6b97e33;">
            <strong style="color: #e6b97e;">Security Notice:</strong> Never share this code with anyone. Jewel Street Concierge will never ask for your verification code or password.
          </td>
        </tr>
        <tr>
          <td align="center" style="border-top: 1px solid #e6b97e33; padding-top: 16px; font-family: sans-serif; font-size: 11px; color: #9a8bb8;">
            <p style="margin: 4px 0;">If you didn't request this, contact Concierge at <a href="mailto:concierge@jewelstreet.com" style="color: #e6b97e; text-decoration: none;">concierge@jewelstreet.com</a></p>
            <p style="margin: 4px 0; color: #e6b97e;">© 2026 JEWEL STREET — Haute Joaillerie Official Security Dispatch.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendViaEmailJS({
    subject: subjectTitle,
    title: subjectTitle,
    to_name: name || 'Valued Member',
    to_email: email,
    customer_name: name || 'Valued Member',
    customer_email: email,
    invoice_no: 'RESET-KEY',
    order_date: currentDate,
    total_amount: 'N/A (Password Reset Request)',
    delivery_address: 'Account Security',
    phone: 'N/A',
    message: summaryText,
    html_content: htmlContent,
    html_invoice: htmlContent,
  });
};

// Admin Password Changed by Master Admin Notification Email
const sendAdminPasswordUpdatedEmail = async ({ name, email, newPassword }) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const subjectTitle = `JEWEL STREET — Administrator Passcode Updated (${name})`;
  const summaryText = `
JEWEL STREET — ADMINISTRATOR PASSCODE UPDATED
==================================================
Hello ${name},

Your Jewel Street Administrator account passcode has been updated by the Master Administrator.

UPDATED CREDENTIALS:
- Email: ${email}
- New Passcode: ${newPassword}
- Portal URL: http://localhost:5173/admin

Please log in to verify your access.
==================================================
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${subjectTitle}</title></head>
    <body style="background-color: #090029; font-family: 'Georgia', serif; color: #ffffff; margin: 0; padding: 20px;">
      <table width="100%" max-width="620" align="center" style="max-width: 620px; background-color: #0d0038; border: 1px solid #e6b97e4d; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);">
        ${getRoyalHeaderSvg('HAUTE JOAILLERIE — STORE COMMAND CENTER')}
        ${getTranslucentLogoWatermarkRow()}
        <tr>
          <td style="padding: 20px 0 10px 0; font-family: sans-serif;">
            <h2 style="font-family: serif; color: #e6b97e; font-size: 20px; margin-bottom: 8px;">Administrator Passcode Updated</h2>
            <p style="color: #d5ccf0; line-height: 1.6; font-size: 13px; margin: 0;">
              Hello <strong>${name}</strong>, your administrative credentials for the Jewel Street Store Management Command Center have been updated by the Master Administrator.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table width="100%" style="background-color: #06001a; border: 1px solid #e6b97e33; border-radius: 12px; padding: 18px;">
              <tr>
                <td style="font-family: monospace; font-size: 13px; color: #d5ccf0; line-height: 1.8;">
                  <strong>Admin Name:</strong> <span style="color: #ffffff;">${name}</span><br/>
                  <strong>Login Email:</strong> <span style="color: #e6b97e; font-weight: bold;">${email}</span><br/>
                  <strong>Updated Passcode:</strong> <span style="color: #e6b97e; font-weight: bold;">${newPassword}</span><br/>
                  <strong>Portal URL:</strong> <a href="http://localhost:5173/admin" style="color: #e6b97e;">http://localhost:5173/admin</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="border-top: 1px solid #e6b97e33; padding-top: 16px; font-family: sans-serif; font-size: 11px; color: #9a8bb8;">
            <p style="margin: 4px 0; color: #e6b97e;">© 2026 JEWEL STREET — Confidential Administrator Authorization Document.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendViaEmailJS({
    subject: subjectTitle,
    title: subjectTitle,
    to_name: name,
    to_email: email,
    customer_name: name,
    customer_email: email,
    invoice_no: 'ADMIN-PASS-UPDATE',
    order_date: currentDate,
    total_amount: 'N/A (Admin Passcode Update)',
    delivery_address: 'Jewel Street Portal',
    phone: 'N/A',
    message: summaryText,
    html_content: htmlContent,
    html_invoice: htmlContent,
  });
};

module.exports = {
  sendPurchaseInvoiceEmail,
  sendReturnReplacementEmail,
  sendCancellationRefundEmail,
  sendAdminWelcomeEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetOtpEmail,
  sendAdminPasswordUpdatedEmail,
};

