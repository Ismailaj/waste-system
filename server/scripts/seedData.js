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
    
    const wasteInstructions = {
      organic: [
        'Compost bin by kitchen door',
        'Green waste bags in backyard',
        'Food scraps in sealed container',
        'Garden waste by fence'
      ],
      recyclable: [
        'Blue bins by garage',
        'Sorted recyclables in containers',
        'Cardboard flattened and bundled',
        'Glass bottles in separate box'
      ],
      hazardous: [
        'Batteries in sealed bag',
        'Paint cans in garage - handle carefully',
        'Electronic waste - fragile items',
        'Chemical containers - wear gloves'
      ],
      general: [
        'Regular trash bags by curb',
        'Mixed waste in black bins',
        'Household items in bags',
        'General refuse containers'
      ]
    };
    
    // Create requests for each resident
    for (let i = 0; i < residentUsers.length; i++) {
      const resident = residentUsers[i];
      const numRequests = Math.floor(Math.random() * 4) + 3; // 3-6 requests per resident
      
      for (let j = 0; j < numRequests; j++) {
        const wasteCategory = wasteCategories[Math.floor(Math.random() * wasteCategories.length)];
        
        // More realistic status distribution
        let status;
        if (j === 0) {
          status = 'pending'; // Always have at least one pending
        } else if (j === 1) {
          status = Math.random() > 0.5 ? 'assigned' : 'in-progress';
        } else {
          status = statuses[Math.floor(Math.random() * statuses.length)];
        }
        
        // Create dates in the past 45 days with more recent bias
        const daysAgo = Math.floor(Math.random() * 45);
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - daysAgo);
        
        const request = {
          requesterId: resident._id,
          wasteCategory,
          pickupLocation: {
            address: resident.profile.address,
            coordinates: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1, // NYC area with variation
              lng: -74.0060 + (Math.random() - 0.5) * 0.1
            },
            instructions: wasteInstructions[wasteCategory][Math.floor(Math.random() * wasteInstructions[wasteCategory].length)]
          },
          status,
          notes: `${wasteCategory.charAt(0).toUpperCase() + wasteCategory.slice(1)} waste collection - ${['Regular pickup', 'Extra volume', 'Urgent request', 'Scheduled service'][Math.floor(Math.random() * 4)]}`,
          createdAt: createdDate,
          updatedAt: createdDate
        };
        
        // Assign collector and set completion date for non-pending requests
        if (status !== 'pending') {
          request.assignedCollector = collectorUsers[Math.floor(Math.random() * collectorUsers.length)]._id;
          
          if (status === 'completed') {
            const completedDate = new Date(createdDate);
            completedDate.setDate(completedDate.getDate() + Math.floor(Math.random() * 5) + 1);
            request.completedDate = completedDate;
            request.updatedAt = completedDate;
          } else if (status === 'assigned') {
            // Set scheduled date for assigned requests
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 7) + 1);
            request.scheduledDate = scheduledDate;
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
    console.log('   👑 ADMIN USERS:');
    console.log('      - admin@wastemanagement.com / Admin123!');
    console.log('      - manager@wastemanagement.com / Manager123!');
    console.log('   🚛 COLLECTOR USERS:');
    console.log('      - john.collector@wastemanagement.com / Collector123!');
    console.log('      - jane.collector@wastemanagement.com / Collector123!');
    console.log('      - mike.collector@wastemanagement.com / Collector123!');
    console.log('   🏠 RESIDENT USERS:');
    console.log('      - alice.resident@email.com / Resident123!');
    console.log('      - bob.resident@email.com / Resident123!');
    console.log('      - carol.resident@email.com / Resident123!');
    console.log('      - david.resident@email.com / Resident123!');
    console.log('      - emma.resident@email.com / Resident123!');
    
    console.log('\n📋 ROLE CAPABILITIES:');
    console.log('   👑 Admins can: Manage users, assign collections, view reports, create routes');
    console.log('   🚛 Collectors can: View assigned routes, update collection status');
    console.log('   🏠 Residents can: Create collection requests, view their own requests');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedData();