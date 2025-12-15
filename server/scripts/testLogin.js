import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api';

const testLogin = async () => {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Test credentials from seed data
    const testCredentials = [
      {
        email: 'admin@wastemanagement.com',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        email: 'john.collector@wastemanagement.com',
        password: 'Collector123!',
        role: 'collector'
      },
      {
        email: 'alice.resident@email.com',
        password: 'Resident123!',
        role: 'resident'
      }
    ];

    for (const credentials of testCredentials) {
      console.log(`\n🔐 Testing login for ${credentials.role}: ${credentials.email}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: credentials.email,
          password: credentials.password
        });

        if (response.data.success) {
          console.log(`✅ Login successful for ${credentials.role}`);
          console.log(`   User: ${response.data.user.username}`);
          console.log(`   Role: ${response.data.user.role}`);
          console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
        } else {
          console.log(`❌ Login failed for ${credentials.role}: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Login error for ${credentials.role}:`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Message: ${error.response.data.message}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
      }
    }

    console.log('\n🏁 Login test completed');

  } catch (error) {
    console.error('❌ Test setup error:', error.message);
  }
};

// Run the test
testLogin();