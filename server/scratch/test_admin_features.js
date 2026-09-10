const axios = require('axios');

async function testAdminFeatures() {
  console.log('--- 1. Testing Orders Endpoint & Filtering ---');
  try {
    const ordersRes = await axios.get('http://localhost:5000/api/orders/all-orders');
    console.log(`Fetched ${ordersRes.data.length} total orders from backend.`);
    if (ordersRes.data.length > 0) {
      console.log('Sample Order Statuses:', ordersRes.data.map(o => o.status));
    }
  } catch (err) {
    console.error('Orders test error:', err.message);
  }

  console.log('\n--- 2. Testing Bulk Making Charges Update (Scope: category "rings", 20% MC) ---');
  try {
    const mcRes = await axios.post('http://localhost:5000/api/products/inventory/update-making-charges', {
      scope: 'category',
      categoryKey: 'rings',
      makingChargePercent: 20
    });
    console.log('Making Charges Update Result:', mcRes.data);

    // Verify updated prices in inventory
    const invRes = await axios.get('http://localhost:5000/api/products/inventory/all');
    const ringItems = invRes.data.filter(p => p.category.toLowerCase() === 'rings');
    console.log('Sample Updated Ring Item:', {
      name: ringItems[0]?.name,
      makingChargePercent: ringItems[0]?.makingChargePercent,
      price: ringItems[0]?.price
    });
  } catch (err) {
    console.error('Making charges test error:', err.message);
  }
}

testAdminFeatures();
