async function testRest() {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: JSON.stringify({
      service_id: 'service_qwc2v11',
      template_id: 'template_kiv2ph2',
      user_id: 'f7Xq2k5J4HeAmh5H3',
      template_params: {
        to_name: 'Deevyanshu Sahu',
        to_email: 'deevyanshusahu@gmail.com',
        message: 'Test message from backend simulation'
      }
    })
  });
  console.log('Status:', res.status);
  console.log('Text:', await res.text());
}
testRest();
