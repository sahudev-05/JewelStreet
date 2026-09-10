const fs = require('fs');

async function check() {
  const url = 'https://api.emailjs.com/api/v1.1/history?user_id=f7Xq2k5J4HeAmh5H3&accessToken=WFftm7MxAkMotDVLX51u-&limit=5';
  const res = await fetch(url);
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Text preview:', text.slice(0, 300));
  const data = JSON.parse(text);
  console.log('Count:', data.rows ? data.rows.length : 0);
  if (data.rows && data.rows.length > 0) {
    for (let i = 0; i < Math.min(3, data.rows.length); i++) {
      const row = data.rows[i];
      console.log(`\n--- Row ${i} (${row.created_at}) ---`);
      console.log('Template:', row.template_id);
      console.log('Recipient:', row.email);
      const params = JSON.parse(row.params || '{}');
      console.log('Params keys:', Object.keys(params));
      if (params.message) console.log('message length:', params.message.length, 'preview:', params.message.slice(0, 100));
      if (params.brand_header) console.log('brand_header present, length:', params.brand_header.length);
      if (params.logo_url) console.log('logo_url:', params.logo_url);
    }
  }
}

check().catch(console.error);
