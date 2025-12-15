/**
 * Feature: waste-management-system, Property 10: Collection completion updates
 * 
 * Property: For any collection marked as completed by an assigned collector, 
 * the Collection_Request status should be updated to completed
 * 
 * Validates: Requirements 3.3
 */

import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { User, CollectionRequest, CollectionRoute } from '../../models/index.js';
import userRoutes from '../../routes/userRoutes.js';
import collectionRoutes from '../../routes/collectionRoutes.js';
import routeRoutes from '../../routes/routeRoutes.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', userRoutes);
  app.use('/api/collections', collectionRoutes);
  app.use('/api/routes', routeRoutes);
  return app;
};

describe('Property 10: Collection completion updates', () => {
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

  test('should update collection status to completed when marked by assigned collector', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validCollectionArbitrary,
        async (residentData, collectorData, collectionData) => {
          let resident = null;
          let collector = null;
          let collection = null;
          let route = null;

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

            // Create collection request
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${residentToken}`)
              .send(collectionData);

            collection = collectionResponse.body.request;

            // Assign collection to collector
            await CollectionRequest.findByIdAndUpdate(collection._id, {
              assignedCollector: collector._id,
              status: 'assigned'
            });

            // Create route for collector
            route = await CollectionRoute.create({
              collectorId: collector._id,
              date: new Date(),
              collections: [collection._id]
            });

            // Update collection status to in-progress first
            await CollectionRequest.findByIdAndUpdate(collection._id, {
              status: 'in-progress'
            });

            // Mark collection as completed by collector
            const completionResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${collectorToken}`)
              .send({ status: 'completed' });

            expect(completionResponse.status).toBe(200);
            expect(completionResponse.body.success).toBe(true);

            const completedCollection = completionResponse.body.request;
            
            // Verify status is updated to completed
            expect(completedCollection.status).toBe('completed');
            
            // Verify completion date is set
            expect(completedCollection.completedDate).toBeDefined();
            
            // Verify in database
            const dbCollection = await CollectionRequest.findById(collection._id);
            expect(dbCollection.status).toBe('completed');
            expect(dbCollection.completedDate).toBeDefined();
            
            // Verify completion date is recent
            const completionTime = new Date(dbCollection.completedDate);
            const now = new Date();
            const timeDiff = now.getTime() - completionTime.getTime();
            expect(timeDiff).toBeLessThan(5000); // Within 5 seconds

          } finally {
            // Clean up
            if (route) {
              await CollectionRoute.findByIdAndDelete(route._id);
            }
            if (collection) {
              await CollectionRequest.findByIdAndDelete(collection._id);
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

  test('should maintain completion consistency across multiple collections', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 2, maxLength: 4 }),
        async (residentData, collectorData, collectionsData) => {
          let resident = null;
          let collector = null;
          let collections = [];
          let route = null;

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

            // Create multiple collection requests
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

              collections.push(collectionResponse.body.request);
            }

            // Assign all collections to collector
            const collectionIds = [];
            for (const collection of collections) {
              await CollectionRequest.findByIdAndUpdate(collection._id, {
                assignedCollector: collector._id,
                status: 'in-progress'
              });
              collectionIds.push(collection._id);
            }

            // Create route for collector
            route = await CollectionRoute.create({
              collectorId: collector._id,
              date: new Date(),
              collections: collectionIds
            });

            // Mark all collections as completed
            const completionPromises = collections.map(collection =>
              request(app)
                .put(`/api/collections/${collection._id}`)
                .set('Authorization', `Bearer ${collectorToken}`)
                .send({ status: 'completed' })
            );

            const completionResponses = await Promise.all(completionPromises);

            // Verify all completions succeeded
            completionResponses.forEach(response => {
              expect(response.status).toBe(200);
              expect(response.body.success).toBe(true);
              expect(response.body.request.status).toBe('completed');
            });

            // Verify all collections are completed in database
            for (const collection of collections) {
              const dbCollection = await CollectionRequest.findById(collection._id);
              expect(dbCollection.status).toBe('completed');
              expect(dbCollection.completedDate).toBeDefined();
            }

          } finally {
            // Clean up
            if (route) {
              await CollectionRoute.findByIdAndDelete(route._id);
            }
            for (const collection of collections) {
              await CollectionRequest.findByIdAndDelete(collection._id);
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

  test('should preserve completion date once set', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validCollectionArbitrary,
        async (residentData, collectorData, collectionData) => {
          let resident = null;
          let collector = null;
          let collection = null;

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
            const collectorToken = collectorRegResponse.body.token;
            const residentToken = residentRegResponse.body.token;

            // Create and assign collection
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${residentToken}`)
              .send(collectionData);

            collection = collectionResponse.body.request;

            await CollectionRequest.findByIdAndUpdate(collection._id, {
              assignedCollector: collector._id,
              status: 'in-progress'
            });

            // Mark as completed first time
            const firstCompletionResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${collectorToken}`)
              .send({ status: 'completed' });

            expect(firstCompletionResponse.status).toBe(200);
            const firstCompletionDate = new Date(firstCompletionResponse.body.request.completedDate);

            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try to update again (should preserve original completion date)
            const secondUpdateResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${collectorToken}`)
              .send({ notes: 'Additional notes' });

            if (secondUpdateResponse.status === 200) {
              const secondCompletionDate = new Date(secondUpdateResponse.body.request.completedDate);
              
              // Completion date should remain the same
              expect(secondCompletionDate.getTime()).toBe(firstCompletionDate.getTime());
            }

          } finally {
            // Clean up
            if (collection) {
              await CollectionRequest.findByIdAndDelete(collection._id);
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