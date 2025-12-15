/**
 * Feature: waste-management-system, Property 8: Collector route display
 * 
 * Property: For any waste collector, logging in should display their assigned 
 * Collection_Route with requests ordered by optimal pickup sequence
 * 
 * Validates: Requirements 3.1, 3.4
 */

import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { User, CollectionRequest, CollectionRoute } from '../../models/index.js';
import userRoutes from '../../routes/userRoutes.js';
import routeRoutes from '../../routes/routeRoutes.js';
import collectionRoutes from '../../routes/collectionRoutes.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', userRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/collections', collectionRoutes);
  return app;
};

describe('Property 8: Collector route display', () => {
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

  // Generator for collection requests
  const validCollectionArbitrary = fc.record({
    wasteCategory: fc.constantFrom('organic', 'recyclable', 'hazardous', 'general'),
    pickupLocation: fc.record({
      address: fc.string({ minLength: 5, maxLength: 200 }),
      coordinates: fc.record({
        lat: fc.float({ min: -90, max: 90 }),
        lng: fc.float({ min: -180, max: 180 })
      }),
      instructions: fc.option(fc.string({ maxLength: 500 }))
    }),
    notes: fc.option(fc.string({ maxLength: 1000 }))
  });

  test('should display assigned route with optimal pickup sequence for any collector', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 2, maxLength: 5 }),
        async (collectorData, residentData, collectionsData) => {
          let collector = null;
          let resident = null;
          let collections = [];
          let route = null;

          try {
            // Create unique users
            const uniqueCollectorData = {
              ...collectorData,
              role: 'collector',
              username: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}_${collectorData.email}`
            };

            const uniqueResidentData = {
              ...residentData,
              role: 'resident',
              username: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}_${residentData.email}`
            };

            // Register users
            const collectorRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollectorData);

            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            collector = collectorRegResponse.body.user;
            resident = residentRegResponse.body.user;
            const collectorToken = collectorRegResponse.body.token;
            const residentToken = residentRegResponse.body.token;

            // Create collection requests
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `${collectionsData[i].pickupLocation.address}_${i}_${Date.now()}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              expect(collectionResponse.status).toBe(201);
              collections.push(collectionResponse.body.request);
            }

            // Create route for collector
            const routeData = {
              collectorId: collector._id,
              date: new Date(),
              collections: collections.map(c => c._id)
            };

            route = await CollectionRoute.create(routeData);

            // Assign collections to collector
            for (const collection of collections) {
              await CollectionRequest.findByIdAndUpdate(collection._id, {
                assignedCollector: collector._id,
                status: 'assigned'
              });
            }

            // Test collector route display
            const routeResponse = await request(app)
              .get(`/api/routes/collector/${collector._id}`)
              .set('Authorization', `Bearer ${collectorToken}`);

            expect(routeResponse.status).toBe(200);
            expect(routeResponse.body.success).toBe(true);
            expect(routeResponse.body.route).toBeDefined();

            const returnedRoute = routeResponse.body.route;
            
            // Verify route belongs to collector
            expect(returnedRoute.collectorId.toString()).toBe(collector._id);
            
            // Verify collections are included
            expect(returnedRoute.collections).toHaveLength(collections.length);
            
            // Verify optimal order is provided
            expect(routeResponse.body.optimizedOrder).toBeDefined();
            expect(routeResponse.body.optimizedOrder).toHaveLength(collections.length);
            
            // Verify all indices in optimized order are valid
            const optimizedOrder = routeResponse.body.optimizedOrder;
            optimizedOrder.forEach(index => {
              expect(index).toBeGreaterThanOrEqual(0);
              expect(index).toBeLessThan(collections.length);
            });

            // Verify no duplicate indices
            const uniqueIndices = new Set(optimizedOrder);
            expect(uniqueIndices.size).toBe(optimizedOrder.length);

          } finally {
            // Clean up
            if (route) {
              await CollectionRoute.findByIdAndDelete(route._id);
            }
            for (const collection of collections) {
              await CollectionRequest.findByIdAndDelete(collection._id);
            }
            if (collector) {
              await User.findByIdAndDelete(collector._id);
            }
            if (resident) {
              await User.findByIdAndDelete(resident._id);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should only allow collectors to view their own routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        async (collector1Data, collector2Data) => {
          let collector1 = null;
          let collector2 = null;
          let route = null;

          try {
            // Create two collectors
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

            const collector1RegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollector1Data);

            const collector2RegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollector2Data);

            collector1 = collector1RegResponse.body.user;
            collector2 = collector2RegResponse.body.user;
            const collector2Token = collector2RegResponse.body.token;

            // Create route for collector1
            route = await CollectionRoute.create({
              collectorId: collector1._id,
              date: new Date(),
              collections: []
            });

            // Try to access collector1's route as collector2
            const unauthorizedResponse = await request(app)
              .get(`/api/routes/collector/${collector1._id}`)
              .set('Authorization', `Bearer ${collector2Token}`);

            expect(unauthorizedResponse.status).toBe(403);
            expect(unauthorizedResponse.body.success).toBe(false);

          } finally {
            // Clean up
            if (route) {
              await CollectionRoute.findByIdAndDelete(route._id);
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

  test('should return empty route when no assignments exist', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArbitrary, async (collectorData) => {
        let collector = null;

        try {
          // Create collector
          const uniqueCollectorData = {
            ...collectorData,
            role: 'collector',
            username: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            email: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}_${collectorData.email}`
          };

          const collectorRegResponse = await request(app)
            .post('/api/auth/register')
            .send(uniqueCollectorData);

          collector = collectorRegResponse.body.user;
          const collectorToken = collectorRegResponse.body.token;

          // Try to get route when none exists
          const routeResponse = await request(app)
            .get(`/api/routes/collector/${collector._id}`)
            .set('Authorization', `Bearer ${collectorToken}`);

          expect(routeResponse.status).toBe(200);
          expect(routeResponse.body.success).toBe(true);
          expect(routeResponse.body.route).toBeNull();
          expect(routeResponse.body.collections).toEqual([]);

        } finally {
          // Clean up
          if (collector) {
            await User.findByIdAndDelete(collector._id);
          }
        }
      }),
      { numRuns: 30 }
    );
  });
});