/**
 * Feature: waste-management-system, Property 13: Collection assignment updates routes
 * 
 * Property: For any valid assignment of a collection request to a collector by an administrator, 
 * the collector's Collection_Route should be updated to include the assigned request
 * 
 * Validates: Requirements 4.3
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

describe('Property 13: Collection assignment updates routes', () => {
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

  test('should update collector route when collection is assigned by admin', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validUserArbitrary,
        validCollectionArbitrary,
        async (adminData, residentData, collectorData, collectionData) => {
          let admin = null;
          let resident = null;
          let collector = null;
          let collection = null;
          let route = null;

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

            // Create collection request
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${residentToken}`)
              .send(collectionData);

            collection = collectionResponse.body.request;

            // Admin assigns collection to collector
            const assignmentResponse = await request(app)
              .post('/api/admin/collections/assign')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({
                collectionId: collection._id,
                collectorId: collector._id,
                scheduledDate: new Date().toISOString()
              });

            expect(assignmentResponse.status).toBe(200);
            expect(assignmentResponse.body.success).toBe(true);

            const assignedCollection = assignmentResponse.body.collection;
            const routeId = assignmentResponse.body.route;

            // Verify collection is assigned
            expect(assignedCollection.assignedCollector._id).toBe(collector._id);
            expect(assignedCollection.status).toBe('assigned');

            // Verify route was created/updated
            expect(routeId).toBeDefined();
            
            const dbRoute = await CollectionRoute.findById(routeId);
            expect(dbRoute).toBeDefined();
            expect(dbRoute.collectorId.toString()).toBe(collector._id);
            expect(dbRoute.collections).toContain(collection._id);

            route = dbRoute;

          } finally {
            // Clean up
            if (route) {
              await CollectionRoute.findByIdAndDelete(route._id);
            }
            if (collection) {
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
      { numRuns: 50 }
    );
  });

  test('should handle multiple assignments to same collector route', async () => {
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
          let collections = [];
          let route = null;

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

            // Create multiple collection requests
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `MultiAssign_${i}_${Date.now()}_${collectionsData[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              collections.push(collectionResponse.body.request);
            }

            let routeId = null;

            // Assign all collections to the same collector
            for (const collection of collections) {
              const assignmentResponse = await request(app)
                .post('/api/admin/collections/assign')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                  collectionId: collection._id,
                  collectorId: collector._id,
                  scheduledDate: new Date().toISOString()
                });

              expect(assignmentResponse.status).toBe(200);
              
              if (!routeId) {
                routeId = assignmentResponse.body.route;
              } else {
                // Should use the same route for same collector on same date
                expect(assignmentResponse.body.route).toBe(routeId);
              }
            }

            // Verify route contains all assigned collections
            const dbRoute = await CollectionRoute.findById(routeId);
            expect(dbRoute).toBeDefined();
            expect(dbRoute.collections).toHaveLength(collections.length);
            
            collections.forEach(collection => {
              expect(dbRoute.collections.map(c => c.toString())).toContain(collection._id);
            });

            route = dbRoute;

          } finally {
            // Clean up
            if (route) {
              await CollectionRoute.findByIdAndDelete(route._id);
            }
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
});