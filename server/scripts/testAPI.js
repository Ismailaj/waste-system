import http from 'http';

const testAPILogin = () => {
  const postData = JSON.stringify({
    email: 'admin@wastemanagement.com',
    password: 'Admin123!'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🧪 Testing API login endpoint...');
  console.log(`📡 POST ${options.hostname}:${options.port}${options.path}`);

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📄 Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('✅ API login test successful!');
        } else {
          console.log('❌ API login test failed:', response.message);
        }
      } catch (error) {
        console.log('❌ Failed to parse response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
};

// Run the test
testAPILogin();