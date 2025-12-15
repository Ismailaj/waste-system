/**
 * Feature: waste-management-system, Property 14: Report generation accuracy
 * 
 * Property: For any collection data in the system, generated reports should 
 * accurately compile statistics and performance metrics
 * 
 * Validates: Requirements 4.4
 */

import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { User, CollectionRequest, CollectionRoute } from '../../models/index.js';
import userRoutes from '../../routes/userRoutes.js';
import adminRoutes from '../../routes/adminRoutes.js';
import collectionRoutes from '../../routes/collectionRoutes.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/collections', collectionRoutes);
  return app;
};

describe('Property 14: Report generation accuracy', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // Generator for valid user data
  const validUserArbitrary = fc.record({
    username: fc.string({ minLength: 3, maxLength: 30 })
      .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 6, maxLength: 50 })
      .filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s))
  });

  // Generator for collection request data
  const validCollectionArbitrary = fc.record({
    wasteCategory: fc.constantFrom('organic', 'recyclable', 'hazardous', 'general'),
    pickupLocation: fc.record({
      address: fc.string({ minLength: 5, maxLength: 200 }),
      coordinates: fc.record({
        lat: fc.float({ min: -90, max: 90 }),
        lng: fc.float({ min: -180, max: 180 })
      })
    }),
    notes: fc.option(fc.string({ maxLength: 1000 }))
  });

  test('should accurately compile collection statistics', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 3, maxLength: 6 }),
        async (adminData, residentData, collectorData, collectionsData) => {
          let admin = null;
          let resident = null;
          let collector = null;
          let collections = [];

          try {
            // Create unique users
            const uniqueAdminData = {
              ...adminData,
              role: 'admin',
              username: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}_${adminData.email}`
            };

            const uniqueResidentData = {
              ...residentData,
              role: 'resident',
              username: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}_${residentData.email}`
            };

            const uniqueCollectorData = {
              ...collectorData,
              role: 'collector',
              username: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}_${collectorData.email}`
            };

            // Register users
            const adminRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueAdminData);

            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            const collectorRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollectorData);

            admin = adminRegResponse.body.user;
            resident = residentRegResponse.body.user;
            collector = collectorRegResponse.body.user;
            
            const adminToken = adminRegResponse.body.token;
            const residentToken = residentRegResponse.body.token;

            // Create collections with known data
            const expectedStats = {
              total: collectionsData.length,
              byStatus: { pending: 0, assigned: 0, completed: 0 },
              byCategory: { organic: 0, recyclable: 0, hazardous: 0, general: 0 }
            };

            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `ReportTest_${i}_${Date.now()}_${collectionsData[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              collections.push(collectionResponse.body.request);
              
              // Track expected statistics
              expectedStats.byCategory[collectionData.wasteCategory]++;
              expectedStats.byStatus.pending++;
            }

            // Assign some collections and update their status
            const midpoint = Math.floor(collections.length / 2);
            for (let i = 0; i < midpoint; i++) {
              await CollectionRequest.findByIdAndUpdate(collections[i]._id, {
                assignedCollector: collector._id,
                status: 'assigned'
              });
              expectedStats.byStatus.pending--;
              expectedStats.byStatus.assigned++;
            }

            // Complete some collections
            const quarterPoint = Math.floor(collections.length / 4);
            for (let i = 0; i < quarterPoint; i++) {
              await CollectionRequest.findByIdAndUpdate(collections[i]._id, {
                status: 'completed',
                completedDate: new Date()
              });
              expectedStats.byStatus.assigned--;
              expectedStats.byStatus.completed++;
            }

            // Generate report
            const reportResponse = await request(app)
              .get('/api/admin/reports/statistics')
              .set('Authorization', `Bearer ${adminToken}`);

            expect(reportResponse.status).toBe(200);
            expect(reportResponse.body.success).toBe(true);

            const statistics = reportResponse.body.statistics;

            // Verify total collections count
            expect(statistics.collections.total).toBeGreaterThanOrEqual(expectedStats.total);

            // Verify status breakdown includes our test data
            if (expectedStats.byStatus.pending > 0) {
              expect(statistics.collections.byStatus.pending).toBeGreaterThanOrEqual(expectedStats.byStatus.pending);
            }
            if (expectedStats.byStatus.assigned > 0) {
              expect(statistics.collections.byStatus.assigned).toBeGreaterThanOrEqual(expectedStats.byStatus.assigned);
            }
            if (expectedStats.byStatus.completed > 0) {
              expect(statistics.collections.byStatus.completed).toBeGreaterThanOrEqual(expectedStats.byStatus.completed);
            }

            // Verify category breakdown includes our test data
            Object.keys(expectedStats.byCategory).forEach(category => {
              if (expectedStats.byCategory[category] > 0) {
                expect(statistics.collections.byCategory[category]).toBeGreaterThanOrEqual(expectedStats.byCategory[category]);
              }
            });

            // Verify user statistics
            expect(statistics.users.total).toBeGreaterThanOrEqual(3); // At least our test users
            expect(statistics.users.byRole.admin).toBeGreaterThanOrEqual(1);
            expect(statistics.users.byRole.resident).toBeGreaterThanOrEqual(1);
            expect(statistics.users.byRole.collector).toBeGreaterThanOrEqual(1);

          } finally {
            // Clean up
            for (const collection of collections) {
              await CollectionRequest.findByIdAndDelete(collection._id);
            }
            if (admin) {
              await User.findByIdAndDelete(admin._id);
            }
            if (resident) {
              await User.findByIdAndDelete(resident._id);
            }
            if (collector) {
              await User.findByIdAndDelete(collector._id);
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should calculate performance metrics accurately', async () => {
    let admin = null;
    let resident = null;
    let collector = null;
    let collections = [];

    try {
      // Create test users
      const adminData = {
        username: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
        password: 'AdminPass123',
        role: 'admin'
      };

      const residentData = {
        username: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
        password: 'ResidentPass123',
        role: 'resident'
      };

      const collectorData = {
        username: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
        password: 'CollectorPass123',
        role: 'collector'
      };

      // Register users
      const adminRegResponse = await request(app)
        .post('/api/auth/register')
        .send(adminData);

      const residentRegResponse = await request(app)
        .post('/api/auth/register')
        .send(residentData);

      const collectorRegResponse = await request(app)
        .post('/api/auth/register')
        .send(collectorData);

      admin = adminRegResponse.body.user;
      resident = residentRegResponse.body.user;
      collector = collectorRegResponse.body.user;
      
      const adminToken = adminRegResponse.body.token;
      const residentToken = residentRegResponse.body.token;

      // Create collections with known completion times
      const testCollections = [
        { wasteCategory: 'general', completionDelay: 1000 }, // 1 second
        { wasteCategory: 'organic', completionDelay: 2000 }, // 2 seconds
        { wasteCategory: 'recyclable', completionDelay: 3000 } // 3 seconds
      ];

      const startTime = new Date();

      for (let i = 0; i < testCollections.length; i++) {
        const collectionData = {
          wasteCategory: testCollections[i].wasteCategory,
          pickupLocation: {
            address: `Performance_${i}_${Date.now()}`,
            coordinates: { lat: 40.7128 + i * 0.001, lng: -74.0060 + i * 0.001 }
          }
        };

        const collectionResponse = await request(app)
          .post('/api/collections')
          .set('Authorization', `Bearer ${residentToken}`)
          .send(collectionData);

        const collection = collectionResponse.body.request;
        collections.push(collection);

        // Assign and complete with known timing
        await CollectionRequest.findByIdAndUpdate(collection._id, {
          assignedCollector: collector._id,
          status: 'assigned'
        });

        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, testCollections[i].completionDelay));

        await CollectionRequest.findByIdAndUpdate(collection._id, {
          status: 'completed',
          completedDate: new Date()
        });
      }

      // Generate report
      const reportResponse = await request(app)
        .get('/api/admin/reports/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: startTime.toISOString(),
          endDate: new Date().toISOString()
        });

      expect(reportResponse.status).toBe(200);
      const statistics = reportResponse.body.statistics;

      // Verify completion time calculation
      expect(statistics.collections.averageCompletionTimeHours).toBeGreaterThan(0);

      // Verify collector performance data
      expect(statistics.collectorPerformance).toBeDefined();
      const collectorPerf = statistics.collectorPerformance.find(p => 
        p.collectorName === collector.username
      );
      
      if (collectorPerf) {
        expect(collectorPerf.completedCollections).toBe(testCollections.length);
        expect(collectorPerf.avgCompletionTimeHours).toBeGreaterThan(0);
      }

    } finally {
      // Clean up
      for (const collection of collections) {
        await CollectionRequest.findByIdAndDelete(collection._id);
      }
      if (admin) {
        await User.findByIdAndDelete(admin._id);
      }
      if (resident) {
        await User.findByIdAndDelete(resident._id);
      }
      if (collector) {
        await User.findByIdAndDelete(collector._id);
      }
    }
  });
});