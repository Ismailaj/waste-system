import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, CollectionRequest, CollectionRoute } from '../models/index.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await CollectionRequest.deleteMany({});
    await CollectionRoute.deleteMany({});
    
    // Create users
    console.log('👥 Creating users...');
    
    // Admin users
    const adminUsers = await User.create([
      {
        username: 'admin',
        email: 'admin@wastemanagement.com',
        password: 'Admin123!',
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+15550001',
          address: '123 Admin Street, City, State 12345'
        }
      },
      {
        username: 'manager',
        email: 'manager@wastemanagement.com',
        password: 'Manager123!',
        role: 'admin',
        profile: {
          firstName: 'Operations',
          lastName: 'Manager',
          phone: '+15550002',
          address: '456 Management Ave, City, State 12345'
        }
      }
    ]);
    
    // Collector users
    const collectorUsers = await User.create([
      {
        username: 'collector1',
        email: 'john.collector@wastemanagement.com',
        password: 'Collector123!',
        role: 'collector',
        profile: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+15551001',
          address: '789 Collector Lane, City, State 12345'
        }
      },
      {
        username: 'collector2',
        email: 'jane.collector@wastemanagement.com',
        password: 'Collector123!',
        role: 'collector',
        profile: {
          firstName: 'Jane',
          lastName: 'Johnson',
          phone: '+15551002',
          address: '321 Pickup Road, City, State 12345'
        }
      },
      {
        username: 'collector3',
        email: 'mike.collector@wastemanagement.com',
        password: 'Collector123!',
        role: 'collector',
        profile: {
          firstName: 'Mike',
          lastName: 'Wilson',
          phone: '+15551003',
          address: '654 Route Street, City, State 12345'
        }
      }
    ]);
    
    // Resident users
    const residentUsers = await User.create([
      {
        username: 'resident1',
        email: 'alice.resident@email.com',
        password: 'Resident123!',
        role: 'resident',
        profile: {
          firstName: 'Alice',
          lastName: 'Brown',
          phone: '+15552001',
          address: '123 Oak Street, City, State 12345'
        }
      },
      {
        username: 'resident2',
        email: 'bob.resident@email.com',
        password: 'Resident123!',
        role: 'resident',
        profile: {
          firstName: 'Bob',
          lastName: 'Davis',
          phone: '+15552002',
          address: '456 Pine Avenue, City, State 12345'
        }
      },
      {
        username: 'resident3',
        email: 'carol.resident@email.com',
        password: 'Resident123!',
        role: 'resident',
        profile: {
          firstName: 'Carol',
          lastName: 'Miller',
          phone: '+15552003',
          address: '789 Maple Drive, City, State 12345'
        }
      },
      {
        username: 'resident4',
        email: 'david.resident@email.com',
        password: 'Resident123!',
        role: 'resident',
        profile: {
          firstName: 'David',
          lastName: 'Garcia',
          phone: '+15552004',
          address: '321 Elm Street, City, State 12345'
        }
      },
      {
        username: 'resident5',
        email: 'emma.resident@email.com',
        password: 'Resident123!',
        role: 'resident',
        profile: {
          firstName: 'Emma',
          lastName: 'Martinez',
          phone: '+15552005',
          address: '654 Cedar Lane, City, State 12345'
        }
      }
    ]);
    
    console.log(`✅ Created ${adminUsers.length} admin users`);
    console.log(`✅ Created ${collectorUsers.length} collector users`);
    console.log(`✅ Created ${residentUsers.length} resident users`);
    
    // Create collection requests
    console.log('📦 Creating collection requests...');
    
    const collectionRequests = [];
    const wasteCategories = ['organic', 'recyclable', 'hazardous', 'general'];
    const statuses = ['pending', 'assigned', 'in-progress', 'completed'];
    
    // Create requests for each resident
    for (let i = 0; i < residentUsers.length; i++) {
      const resident = residentUsers[i];
      const numRequests = Math.floor(Math.random() * 4) + 2; // 2-5 requests per resident
      
      for (let j = 0; j < numRequests; j++) {
        const wasteCategory = wasteCategories[Math.floor(Math.random() * wasteCategories.length)];
        const status = j === 0 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)];
        
        // Create dates in the past 30 days
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
        
        const request = {
          requesterId: resident._id,
          wasteCategory,
          pickupLocation: {
            address: resident.profile.address,
            coordinates: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1, // NYC area with variation
              lng: -74.0060 + (Math.random() - 0.5) * 0.1
            },
            instructions: [
              'Leave bins by the front door',
              'Ring doorbell when collecting',
              'Bins are in the garage',
              'Side entrance preferred',
              'Call before pickup'
            ][Math.floor(Math.random() * 5)]
          },
          status,
          notes: [
            'Regular weekly pickup',
            'Extra bags this week',
            'Heavy items included',
            'Fragile materials',
            'Time-sensitive pickup'
          ][Math.floor(Math.random() * 5)],
          createdAt: createdDate,
          updatedAt: createdDate
        };
        
        // Assign collector and set completion date for non-pending requests
        if (status !== 'pending') {
          request.assignedCollector = collectorUsers[Math.floor(Math.random() * collectorUsers.length)]._id;
          
          if (status === 'completed') {
            const completedDate = new Date(createdDate);
            completedDate.setDate(completedDate.getDate() + Math.floor(Math.random() * 7) + 1);
            request.completedDate = completedDate;
            request.updatedAt = completedDate;
          }
        }
        
        collectionRequests.push(request);
      }
    }
    
    const createdRequests = await CollectionRequest.create(collectionRequests);
    console.log(`✅ Created ${createdRequests.length} collection requests`);
    
    // Create collection routes
    console.log('🗺️ Creating collection routes...');
    
    const routes = [];
    const today = new Date();
    
    // Create routes for today and next week only (no past dates)
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const routeDate = new Date(today);
      routeDate.setDate(routeDate.getDate() + dayOffset);
      routeDate.setHours(0, 0, 0, 0); // Set to start of day
      
      // Skip weekends for this example
      if (routeDate.getDay() === 0 || routeDate.getDay() === 6) continue;
      
      // Assign routes to collectors
      for (let i = 0; i < collectorUsers.length; i++) {
        const collector = collectorUsers[i];
        
        // Get assigned requests for this collector on this date
        const assignedRequests = createdRequests.filter(req => 
          req.assignedCollector && 
          req.assignedCollector.toString() === collector._id.toString() &&
          Math.abs(new Date(req.createdAt).getTime() - routeDate.getTime()) < 7 * 24 * 60 * 60 * 1000 // Within a week
        );
        
        if (assignedRequests.length > 0) {
          const route = {
            collectorId: collector._id,
            date: routeDate,
            collections: assignedRequests.slice(0, Math.min(5, assignedRequests.length)).map(req => req._id),
            optimizedOrder: assignedRequests.slice(0, Math.min(5, assignedRequests.length)).map((_, index) => index),
            status: dayOffset === 0 ? 'active' : 'planned',
            createdAt: routeDate,
            updatedAt: routeDate
          };
          
          routes.push(route);
        }
      }
    }
    
    const createdRoutes = await CollectionRoute.create(routes);
    console.log(`✅ Created ${createdRoutes.length} collection routes`);
    
    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${adminUsers.length + collectorUsers.length + residentUsers.length}`);
    console.log(`      - Admins: ${adminUsers.length}`);
    console.log(`      - Collectors: ${collectorUsers.length}`);
    console.log(`      - Residents: ${residentUsers.length}`);
    console.log(`   📦 Collection Requests: ${createdRequests.length}`);
    console.log(`   🗺️ Collection Routes: ${createdRoutes.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@wastemanagement.com / Admin123!');
    console.log('   Manager: manager@wastemanagement.com / Manager123!');
    console.log('   Collector: john.collector@wastemanagement.com / Collector123!');
    console.log('   Resident: alice.resident@email.com / Resident123!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedData();