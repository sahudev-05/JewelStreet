async function test() {
  const emails = [
    'deevyanshusahu05@gmail.com',
    'deevyanshusahu@bcah.christuniversity.in',
    'deevyanshu.sahu@gmail.com'
  ];

  for (const email of emails) {
    console.log(`\nTesting ${email}...`);
    const res = await fetch('http://localhost:5000/api/auth/google-direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: 'Test User',
        portal: 'customer'
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  }
}

test().catch(console.error);
