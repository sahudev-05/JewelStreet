const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sendOrderDeliveredEmail } = require('../services/emailService');

async function testFinalTweaks() {
  console.log('--- 1. Testing Daily Gold Rate Caching ---');
  try {
    const res1 = await axios.get('http://localhost:5000/api/products/goldrate');
    console.log('First Call Result:', {
      date: res1.data.date,
      goldRatePerGramINR: res1.data.goldRatePerGramINR,
      lastUpdated: res1.data.lastUpdated
    });

    const dailyFileExists = fs.existsSync(path.join(__dirname, '../data/daily_gold_rate.json'));
    console.log('Daily rate cache file exists:', dailyFileExists);

    const res2 = await axios.get('http://localhost:5000/api/products/goldrate');
    console.log('Second Call (From Cache) Result:', {
      date: res2.data.date,
      goldRatePerGramINR: res2.data.goldRatePerGramINR,
      lastUpdated: res2.data.lastUpdated
    });
  } catch (err) {
    console.error('Gold rate test error:', err.message);
  }

  console.log('\n--- 2. Testing Delivered & Transit Notification Email ---');
  try {
    const testEmailRes = await sendOrderDeliveredEmail({
      customerName: 'Deevyanshu Sahu',
      customerEmail: 'deevyanshusahu@gmail.com',
      invoiceNo: 'INV-JS-2026-9999',
      items: [
        { name: 'Royal Heritage Gold Necklace', purity: '91.6%', price: '₹1,25,000', qty: 1 },
        { name: 'Solitaire Diamond Ring', purity: '75%', price: '₹45,000', qty: 2 }
      ],
      totalAmount: 215000,
      status: 'Delivered'
    });
    console.log('Delivered Email Dispatch Result:', testEmailRes);
  } catch (err) {
    console.error('Delivered email test error:', err.message);
  }

  console.log('\n--- 3. Testing Price Parsing Regex Math ---');
  const priceStr1 = '₹1,25,000';
  const priceStr2 = '₹45,000';
  const parsePrice = (str) => {
    const match = str.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  };
  console.log(`Parsing "${priceStr1}":`, parsePrice(priceStr1));
  console.log(`Parsing "${priceStr2}":`, parsePrice(priceStr2));
  console.log('Total for (1 * ₹1,25,000 + 2 * ₹45,000):', parsePrice(priceStr1) * 1 + parsePrice(priceStr2) * 2);
}

testFinalTweaks();
