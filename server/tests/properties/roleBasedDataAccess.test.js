/**
 * Feature: waste-management-system, Property 12: Role-based data access
 * 
 * Property: For any user querying collection requests, the system should return only 
 * the requests appropriate for their role (own requests for residents, assigned requests 
 * for collectors, all requests for admins)
 * 
 * Validates: Requirements 4.2, 5.1
 */

import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { User, CollectionRequest } from '../../models/index.js';
import userRoutes from '../../routes/userRoutes.js';
import collectionRoutes from '../../routes/collectionRoutes.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', userRoutes);
  app.use('/api/collections', collectionRoutes);
  return app;
};

describe('Property 12: Role-based data access', () => {
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

  test('should return only own requests for residents', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 2, maxLength: 4 }),
        fc.array(validCollectionArbitrary, { minLength: 1, maxLength: 3 }),
        async (resident1Data, resident2Data, resident1Collections, resident2Collections) => {
          let resident1 = null;
          let resident2 = null;
          let resident1CollectionIds = [];
          let resident2CollectionIds = [];

          try {
            // Create unique residents
            const uniqueResident1Data = {
              ...resident1Data,
              role: 'resident',
              username: `resident1_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident1_${Date.now()}_${Math.random().toString(36).substring(7)}_${resident1Data.email}`
            };

            const uniqueResident2Data = {
              ...resident2Data,
              role: 'resident',
              username: `resident2_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident2_${Date.now()}_${Math.random().toString(36).substring(7)}_${resident2Data.email}`
            };

            // Register residents
            const resident1RegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResident1Data);

            const resident2RegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResident2Data);

            resident1 = resident1RegResponse.body.user;
            resident2 = resident2RegResponse.body.user;
            const resident1Token = resident1RegResponse.body.token;
            const resident2Token = resident2RegResponse.body.token;

            // Create collections for resident1
            for (let i = 0; i < resident1Collections.length; i++) {
              const collectionData = {
                ...resident1Collections[i],
                pickupLocation: {
                  ...resident1Collections[i].pickupLocation,
                  address: `Resident1_${i}_${Date.now()}_${resident1Collections[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${resident1Token}`)
                .send(collectionData);

              resident1CollectionIds.push(collectionResponse.body.request._id);
            }

            // Create collections for resident2
            for (let i = 0; i < resident2Collections.length; i++) {
              const collectionData = {
                ...resident2Collections[i],
                pickupLocation: {
                  ...resident2Collections[i].pickupLocation,
                  address: `Resident2_${i}_${Date.now()}_${resident2Collections[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${resident2Token}`)
                .send(collectionData);

              resident2CollectionIds.push(collectionResponse.body.request._id);
            }

            // Resident1 should only see their own collections
            const resident1ViewResponse = await request(app)
              .get('/api/collections')
              .set('Authorization', `Bearer ${resident1Token}`);

            expect(resident1ViewResponse.status).toBe(200);
            expect(resident1ViewResponse.body.success).toBe(true);
            
            const resident1Collections = resident1ViewResponse.body.requests;
            expect(resident1Collections).toHaveLength(resident1CollectionIds.length);
            
            // Verify all returned collections belong to resident1
            resident1Collections.forEach(collection => {
              expect(collection.requesterId._id).toBe(resident1._id);
              expect(resident1CollectionIds).toContain(collection._id);
            });

            // Resident2 should only see their own collections
            const resident2ViewResponse = await request(app)
              .get('/api/collections')
              .set('Authorization', `Bearer ${resident2Token}`);

            expect(resident2ViewResponse.status).toBe(200);
            expect(resident2ViewResponse.body.success).toBe(true);
            
            const resident2Collections = resident2ViewResponse.body.requests;
            expect(resident2Collections).toHaveLength(resident2CollectionIds.length);
            
            // Verify all returned collections belong to resident2
            resident2Collections.forEach(collection => {
              expect(collection.requesterId._id).toBe(resident2._id);
              expect(resident2CollectionIds).toContain(collection._id);
            });

          } finally {
            // Clean up
            for (const id of resident1CollectionIds) {
              await CollectionRequest.findByIdAndDelete(id);
            }
            for (const id of resident2CollectionIds) {
              await CollectionRequest.findByIdAndDelete(id);
            }
            if (resident1) {
              await User.findByIdAndDelete(resident1._id);
            }
            if (resident2) {
              await User.findByIdAndDelete(resident2._id);
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should return only assigned requests for collectors', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 2, maxLength: 4 }),
        async (residentData, collector1Data, collector2Data, collectionsData) => {
          let resident = null;
          let collector1 = null;
          let collector2 = null;
          let allCollectionIds = [];
          let collector1AssignedIds = [];

          try {
            // Create unique users
            const uniqueResidentData = {
              ...residentData,
              role: 'resident',
              username: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}_${residentData.email}`
            };

            const uniqueCollector1Data = {
              ...collector1Data,
              role: 'collector',
              username: `collector1_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `collector1_${Date.now()}_${Math.random().toString(36).substring(7)}_${collector1Data.email}`
            };

            const uniqueCollector2Data = {
              ...collector2Data,
              role: 'collector',
              username: `collector2_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `collector2_${Date.now()}_${Math.random().toString(36).substring(7)}_${collector2Data.email}`
            };

            // Register users
            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            const collector1RegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollector1Data);

            const collector2RegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollector2Data);

            resident = residentRegResponse.body.user;
            collector1 = collector1RegResponse.body.user;
            collector2 = collector2RegResponse.body.user;
            
            const residentToken = residentRegResponse.body.token;
            const collector1Token = collector1RegResponse.body.token;
            const collector2Token = collector2RegResponse.body.token;

            // Create collections
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `Collection_${i}_${Date.now()}_${collectionsData[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              allCollectionIds.push(collectionResponse.body.request._id);
            }

            // Assign some collections to collector1, others to collector2
            const midpoint = Math.floor(allCollectionIds.length / 2);
            
            for (let i = 0; i < midpoint; i++) {
              await CollectionRequest.findByIdAndUpdate(allCollectionIds[i], {
                assignedCollector: collector1._id,
                status: 'assigned'
              });
              collector1AssignedIds.push(allCollectionIds[i]);
            }

            for (let i = midpoint; i < allCollectionIds.length; i++) {
              await CollectionRequest.findByIdAndUpdate(allCollectionIds[i], {
                assignedCollector: collector2._id,
                status: 'assigned'
              });
            }

            // Collector1 should only see their assigned collections
            const collector1ViewResponse = await request(app)
              .get('/api/collections')
              .set('Authorization', `Bearer ${collector1Token}`);

            expect(collector1ViewResponse.status).toBe(200);
            expect(collector1ViewResponse.body.success).toBe(true);
            
            const collector1Collections = collector1ViewResponse.body.requests;
            expect(collector1Collections).toHaveLength(collector1AssignedIds.length);
            
            // Verify all returned collections are assigned to collector1
            collector1Collections.forEach(collection => {
              expect(collection.assignedCollector._id).toBe(collector1._id);
              expect(collector1AssignedIds).toContain(collection._id);
            });

            // Collector2 should only see their assigned collections
            const collector2ViewResponse = await request(app)
              .get('/api/collections')
              .set('Authorization', `Bearer ${collector2Token}`);

            expect(collector2ViewResponse.status).toBe(200);
            expect(collector2ViewResponse.body.success).toBe(true);
            
            const collector2Collections = collector2ViewResponse.body.requests;
            expect(collector2Collections).toHaveLength(allCollectionIds.length - collector1AssignedIds.length);
            
            // Verify all returned collections are assigned to collector2
            collector2Collections.forEach(collection => {
              expect(collection.assignedCollector._id).toBe(collector2._id);
              expect(collector1AssignedIds).not.toContain(collection._id);
            });

          } finally {
            // Clean up
            for (const id of allCollectionIds) {
              await CollectionRequest.findByIdAndDelete(id);
            }
            if (resident) {
              await User.findByIdAndDelete(resident._id);
            }
            if (collector1) {
              await User.findByIdAndDelete(collector1._id);
            }
            if (collector2) {
              await User.findByIdAndDelete(collector2._id);
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should return all requests for admins', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 2, maxLength: 4 }),
        async (adminData, residentData, collectorData, collectionsData) => {
          let admin = null;
          let resident = null;
          let collector = null;
          let allCollectionIds = [];

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

            // Create collections as resident
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `AdminTest_${i}_${Date.now()}_${collectionsData[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              allCollectionIds.push(collectionResponse.body.request._id);
            }

            // Assign some collections to collector
            const midpoint = Math.floor(allCollectionIds.length / 2);
            for (let i = 0; i < midpoint; i++) {
              await CollectionRequest.findByIdAndUpdate(allCollectionIds[i], {
                assignedCollector: collector._id,
                status: 'assigned'
              });
            }

            // Admin should see ALL collections
            const adminViewResponse = await request(app)
              .get('/api/collections')
              .set('Authorization', `Bearer ${adminToken}`);

            expect(adminViewResponse.status).toBe(200);
            expect(adminViewResponse.body.success).toBe(true);
            
            const adminCollections = adminViewResponse.body.requests;
            expect(adminCollections).toHaveLength(allCollectionIds.length);
            
            // Verify admin sees all collections regardless of assignment
            const returnedIds = adminCollections.map(c => c._id);
            allCollectionIds.forEach(id => {
              expect(returnedIds).toContain(id);
            });

            // Verify admin sees both assigned and unassigned collections
            const assignedCollections = adminCollections.filter(c => c.assignedCollector);
            const unassignedCollections = adminCollections.filter(c => !c.assignedCollector);
            
            expect(assignedCollections.length).toBe(midpoint);
            expect(unassignedCollections.length).toBe(allCollectionIds.length - midpoint);

          } finally {
            // Clean up
            for (const id of allCollectionIds) {
              await CollectionRequest.findByIdAndDelete(id);
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

  test('should maintain role-based access consistency across different query parameters', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 3, maxLength: 5 }),
        async (residentData, collectorData, collectionsData) => {
          let resident = null;
          let collector = null;
          let allCollectionIds = [];

          try {
            // Create unique users
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
            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            const collectorRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollectorData);

            resident = residentRegResponse.body.user;
            collector = collectorRegResponse.body.user;
            
            const residentToken = residentRegResponse.body.token;
            const collectorToken = collectorRegResponse.body.token;

            // Create collections with different categories and statuses
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `QueryTest_${i}_${Date.now()}_${collectionsData[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              allCollectionIds.push(collectionResponse.body.request._id);
            }

            // Assign some collections to collector
            const assignedIds = allCollectionIds.slice(0, 2);
            for (const id of assignedIds) {
              await CollectionRequest.findByIdAndUpdate(id, {
                assignedCollector: collector._id,
                status: 'assigned'
              });
            }

            // Test different query parameters
            const queryParams = [
              { status: 'pending' },
              { wasteCategory: 'general' },
              { status: 'assigned' },
              { limit: 2 }
            ];

            for (const params of queryParams) {
              // Resident should only see their own collections (filtered by params)
              const residentResponse = await request(app)
                .get('/api/collections')
                .query(params)
                .set('Authorization', `Bearer ${residentToken}`);

              expect(residentResponse.status).toBe(200);
              residentResponse.body.requests.forEach(collection => {
                expect(collection.requesterId._id).toBe(resident._id);
              });

              // Collector should only see assigned collections (filtered by params)
              const collectorResponse = await request(app)
                .get('/api/collections')
                .query(params)
                .set('Authorization', `Bearer ${collectorToken}`);

              expect(collectorResponse.status).toBe(200);
              collectorResponse.body.requests.forEach(collection => {
                expect(collection.assignedCollector._id).toBe(collector._id);
              });
            }

          } finally {
            // Clean up
            for (const id of allCollectionIds) {
              await CollectionRequest.findByIdAndDelete(id);
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
      { numRuns: 20 }
    );
  });
});