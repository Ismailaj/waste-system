import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const testLogin = async () => {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Connect to database
    await connectDB();
    
    // Test credentials from seed data
    const testCredentials = [
      {
        email: 'admin@wastemanagement.com',
        password: 'Admin123!',
        role: 'admin'
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
        // Find user by email
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (!user) {
          console.log(`❌ User not found: ${credentials.email}`);
          continue;
        }
        
        console.log(`✅ User found: ${user.username}`);
        
        // Test password comparison
        const isPasswordValid = await user.comparePassword(credentials.password);
        
        if (isPasswordValid) {
          console.log(`✅ Password validation successful for ${credentials.role}`);
          console.log(`   User: ${user.username}`);
          console.log(`   Role: ${user.role}`);
        } else {
          console.log(`❌ Password validation failed for ${credentials.role}`);
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${credentials.role}: ${error.message}`);
      }
    }

    console.log('\n🏁 Login test completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test setup error:', error.message);
    process.exit(1);
  }
};

// Run the test
testLogin();