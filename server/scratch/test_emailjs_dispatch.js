const emailjs = require('@emailjs/nodejs');

const serviceID = 'service_qwc2v11';
const templateID = 'template_kiv2ph2';
const publicKey = 'f7Xq2k5J4HeAmh5H3';
const privateKey = 'WFftm7MxAkMotDVLX51u-';
const PUBLIC_LOGO_URL = 'https://iili.io/n3SbdKb.png';

const buildBrandedEmailHeader = (title = 'Jewel Street') => `
<div style="background-color:#0d0038; border:1px solid rgba(230,185,126,0.35); border-radius:14px; text-align:center; padding:24px 16px 20px; margin-bottom:18px; box-shadow:0 8px 24px rgba(0,0,0,0.85);">
  <img src="${PUBLIC_LOGO_URL}" alt="Jewel Street Logo" width="76" height="76"
       style="border-radius:50%; object-fit:contain; border:2px solid #e6b97e; display:block; margin:0 auto 12px; background:#090029; box-shadow:0 0 16px rgba(230,185,126,0.35);" />
  <div style="font-family:'Georgia',serif; font-size:24px; font-weight:700; color:#fdfbf7; letter-spacing:3px; text-transform:uppercase;">JEWEL STREET</div>
  <div style="font-size:11px; color:#e6b97e; margin-top:4px; letter-spacing:1.8px; text-transform:uppercase; font-weight:600;">Royal Fine Jewellery &amp; Luxury Collection</div>
  <div style="margin-top:12px; font-size:13px; font-weight:600; color:#d5ccf0; border-top:1px solid rgba(230,185,126,0.25); padding-top:10px; letter-spacing:0.5px;">${title}</div>
</div>`;

const buildBrandedEmailFooter = () => `
<div style="background-color:#0d0038; border:1px solid rgba(230,185,126,0.25); border-radius:14px; text-align:center; margin-top:24px; padding:20px 16px; box-shadow:0 8px 24px rgba(0,0,0,0.85);">
  <img src="${PUBLIC_LOGO_URL}" alt="JS" width="40" height="40"
       style="border-radius:50%; object-fit:contain; opacity:0.9; margin-bottom:8px; border:1.5px solid #e6b97e; background:#090029;" />
  <div style="font-size:12px; color:#e6b97e; font-weight:700; letter-spacing:0.6px;">© ${new Date().getFullYear()} Jewel Street Royal Jewellery</div>
  <div style="font-size:11px; color:#d5ccf0; margin-top:4px;">✨ Certified 100% BIS Hallmarked Fine Jewellery · 24×7 Concierge Service</div>
  <div style="font-size:10px; color:#9a8bb8; margin-top:4px;">support@jewelstreet.com · +91 1800 233 8899</div>
</div>`;

const billSplitupHtml = `
<div style="background-color:#0d0038; border:1px solid rgba(230,185,126,0.35); border-radius:14px; padding:22px; margin:16px 0; font-family:'Segoe UI',sans-serif; color:#fdfbf7; box-shadow:0 8px 24px rgba(0,0,0,0.85);">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px; border-bottom:1px solid rgba(230,185,126,0.25); padding-bottom:14px;">
    <tr>
      <td style="vertical-align:top; font-size:13px; color:#d5ccf0; line-height:1.7;">
        <strong style="color:#e6b97e;">Official Tax Invoice:</strong> INV-JS-TEST-01<br/>
        <strong style="color:#e6b97e;">Invoice Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br/>
        <strong style="color:#e6b97e;">Payment Status:</strong> <span style="color:#10b981; font-weight:700;">Paid Online (100% Secured)</span>
      </td>
      <td style="vertical-align:top; text-align:right; font-size:13px; color:#d5ccf0; line-height:1.7;">
        <strong style="color:#e6b97e;">Billed &amp; Shipped To:</strong><br/>
        <strong style="color:#fdfbf7;">Deevyanshu Sahu</strong><br/>
        Bangalore, Karnataka<br/>
        Contact: +91 9876543210
      </td>
    </tr>
  </table>

  <div style="font-family:'Georgia',serif; font-size:15px; color:#e6b97e; font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">
    Purchased Items Breakdown
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background-color:#12013b; border:1px solid rgba(230,185,126,0.25); border-radius:10px; overflow:hidden; margin-bottom:18px; font-size:13px;">
    <thead>
      <tr style="background-color:#1b0254; color:#e6b97e; text-align:left; border-bottom:2px solid #e6b97e;">
        <th style="padding:10px 12px;">#</th>
        <th style="padding:10px 12px;">Item</th>
        <th style="padding:10px 12px;">Purity</th>
        <th style="padding:10px 12px; text-align:center;">Qty</th>
        <th style="padding:10px 12px; text-align:right;">Unit Price</th>
        <th style="padding:10px 12px; text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid rgba(230,185,126,0.18);">
        <td style="padding:10px 12px; color:#fdfbf7;">1</td>
        <td style="padding:10px 12px; color:#fdfbf7; font-weight:600;">Royal Solitaire Diamond Ring</td>
        <td style="padding:10px 12px; color:#e6b97e;">18K Diamond (VVS1)</td>
        <td style="padding:10px 12px; text-align:center; color:#fdfbf7;">1</td>
        <td style="padding:10px 12px; text-align:right; color:#d5ccf0;">₹1,45,000</td>
        <td style="padding:10px 12px; text-align:right; color:#e6b97e; font-weight:700;">₹1,45,000</td>
      </tr>
    </tbody>
  </table>

  <div style="background-color:#12013b; border:1px solid rgba(230,185,126,0.3); border-radius:10px; padding:16px 18px;">
    <div style="font-family:'Georgia',serif; font-size:14px; color:#e6b97e; font-weight:700; margin-bottom:12px; border-bottom:1px solid rgba(230,185,126,0.2); padding-bottom:6px; letter-spacing:0.8px;">
      Certified Bill Splitup &amp; Tax Calculation
    </div>
    <table width="100%" cellpadding="5" cellspacing="0" style="font-size:13px; color:#d5ccf0;">
      <tr>
        <td>Gross Gold &amp; Gemstone Value</td>
        <td style="text-align:right; color:#fdfbf7; font-weight:600;">₹1,18,900</td>
      </tr>
      <tr>
        <td>Atelier Crafting &amp; Making Charges (18%)</td>
        <td style="text-align:right; color:#fdfbf7; font-weight:600;">₹26,100</td>
      </tr>
      <tr style="border-top:1px dashed rgba(230,185,126,0.25);">
        <td style="color:#e6b97e; font-weight:700;">Base Jewellery Subtotal</td>
        <td style="text-align:right; color:#e6b97e; font-weight:700;">₹1,45,000</td>
      </tr>
      <tr>
        <td>Central GST (CGST @ 1.5%)</td>
        <td style="text-align:right; color:#fdfbf7;">₹2,175</td>
      </tr>
      <tr>
        <td>State GST (SGST @ 1.5%)</td>
        <td style="text-align:right; color:#fdfbf7;">₹2,175</td>
      </tr>
      <tr>
        <td>Armored Insured Transit Delivery</td>
        <td style="text-align:right; color:#e6b97e; font-weight:700;">FREE (Waived)</td>
      </tr>
      <tr style="border-top:2px solid #e6b97e;">
        <td style="font-family:'Georgia',serif; font-size:16px; color:#e6b97e; font-weight:700; padding-top:10px;">Grand Total Amount Paid</td>
        <td style="font-family:'Georgia',serif; font-size:20px; color:#e6b97e; font-weight:700; text-align:right; padding-top:10px;">₹1,45,000</td>
      </tr>
    </table>
  </div>
</div>
`;

async function run() {
  const params = {
    to_name: 'Deevyanshu Sahu',
    to_email: 'deevyanshusahu@gmail.com',
    customer_name: 'Deevyanshu Sahu',
    customer_email: 'deevyanshusahu@gmail.com',
    name: 'Deevyanshu Sahu',
    email: 'deevyanshusahu@gmail.com',
    from_name: 'Jewel Street Royal Concierge',
    subject: 'JEWEL STREET — Verified Invoice & Certified Bill Splitup (INV-JS-TEST-01)',
    logo_url: PUBLIC_LOGO_URL,
    brand_header: buildBrandedEmailHeader('Purchase Invoice Receipt'),
    brand_footer: buildBrandedEmailFooter(),
    message: billSplitupHtml,
    html_content: billSplitupHtml,
    html_invoice: billSplitupHtml,
    details: billSplitupHtml,
    content: billSplitupHtml,
    body: billSplitupHtml,
    order_details: billSplitupHtml,
    bill_splitup: billSplitupHtml,
  };

  console.log('Sending test email to deevyanshusahu@gmail.com...');
  const res = await emailjs.send(serviceID, templateID, params, {
    publicKey,
    privateKey,
  });
  console.log('EmailJS send result:', res);
}

run().catch(console.error);
