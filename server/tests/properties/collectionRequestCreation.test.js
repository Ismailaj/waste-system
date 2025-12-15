/**
 * Feature: waste-management-system, Property 5: Collection request creation with unique identifiers
 * 
 * Property: For any valid collection request data, creating a request should result in 
 * a stored Collection_Request with pending status and unique identifier
 * 
 * Validates: Requirements 2.1, 2.4
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

describe('Property 5: Collection request creation with unique identifiers', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // Generator for valid collection request data
  const validCollectionRequestArbitrary = fc.record({
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

  // Generator for valid user data
  const validUserArbitrary = fc.record({
    username: fc.string({ minLength: 3, maxLength: 30 })
      .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 6, maxLength: 50 })
      .filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s)),
    role: fc.constantFrom('resident', 'admin')
  });

  test('should create collection request with pending status and unique identifier', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validCollectionRequestArbitrary,
        async (userData, collectionData) => {
          let createdUser = null;
          let createdRequest = null;

          try {
            // Create unique user
            const uniqueUserData = {
              ...userData,
              username: `${userData.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${userData.email}`
            };

            // Register user
            const registerResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueUserData);

            expect(registerResponse.status).toBe(201);
            createdUser = registerResponse.body.user;
            const token = registerResponse.body.token;

            // Create collection request
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${token}`)
              .send(collectionData);

            expect(collectionResponse.status).toBe(201);
            expect(collectionResponse.body.success).toBe(true);
            
            const createdRequestData = collectionResponse.body.request;
            createdRequest = createdRequestData;

            // Verify collection request properties
            expect(createdRequestData._id).toBeDefined();
            expect(createdRequestData.status).toBe('pending');
            expect(createdRequestData.wasteCategory).toBe(collectionData.wasteCategory);
            expect(createdRequestData.pickupLocation.address).toBe(collectionData.pickupLocation.address);
            
            // Verify unique identifier
            expect(collectionResponse.body.uniqueId).toBeDefined();
            expect(collectionResponse.body.uniqueId).toBe(createdRequestData._id);

            // Verify coordinates are stored correctly
            if (collectionData.pickupLocation.coordinates) {
              expect(createdRequestData.pickupLocation.coordinates.lat).toBeCloseTo(
                collectionData.pickupLocation.coordinates.lat, 5
              );
              expect(createdRequestData.pickupLocation.coordinates.lng).toBeCloseTo(
                collectionData.pickupLocation.coordinates.lng, 5
              );
            }

            // Verify requester is correctly linked
            expect(createdRequestData.requesterId._id).toBe(createdUser._id);

            // Verify timestamps
            expect(createdRequestData.createdAt).toBeDefined();
            expect(createdRequestData.updatedAt).toBeDefined();

            // Verify request is stored in database
            const storedRequest = await CollectionRequest.findById(createdRequestData._id);
            expect(storedRequest).toBeDefined();
            expect(storedRequest.status).toBe('pending');
            expect(storedRequest.wasteCategory).toBe(collectionData.wasteCategory);

          } finally {
            // Clean up
            if (createdRequest) {
              await CollectionRequest.findByIdAndDelete(createdRequest._id);
            }
            if (createdUser) {
              await User.findByIdAndDelete(createdUser._id);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should generate unique identifiers for multiple requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        fc.array(validCollectionRequestArbitrary, { minLength: 2, maxLength: 5 }),
        async (userData, collectionsData) => {
          let createdUser = null;
          const createdRequests = [];

          try {
            // Create unique user
            const uniqueUserData = {
              ...userData,
              username: `${userData.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${userData.email}`
            };

            // Register user
            const registerResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueUserData);

            createdUser = registerResponse.body.user;
            const token = registerResponse.body.token;

            // Create multiple collection requests
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `${collectionsData[i].pickupLocation.address}_${i}` // Make addresses unique
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${token}`)
                .send(collectionData);

              expect(collectionResponse.status).toBe(201);
              createdRequests.push(collectionResponse.body.request);
            }

            // Verify all requests have unique identifiers
            const requestIds = createdRequests.map(req => req._id);
            const uniqueIds = new Set(requestIds);
            expect(uniqueIds.size).toBe(createdRequests.length);

            // Verify all requests have pending status
            createdRequests.forEach(req => {
              expect(req.status).toBe('pending');
              expect(req.requesterId._id).toBe(createdUser._id);
            });

            // Verify all requests are stored in database
            for (const req of createdRequests) {
              const storedRequest = await CollectionRequest.findById(req._id);
              expect(storedRequest).toBeDefined();
              expect(storedRequest.status).toBe('pending');
            }

          } finally {
            // Clean up
            for (const req of createdRequests) {
              await CollectionRequest.findByIdAndDelete(req._id);
            }
            if (createdUser) {
              await User.findByIdAndDelete(createdUser._id);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle concurrent request creation while maintaining uniqueness', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        fc.array(validCollectionRequestArbitrary, { minLength: 3, maxLength: 5 }),
        async (userData, collectionsData) => {
          let createdUser = null;
          const createdRequests = [];

          try {
            // Create unique user
            const uniqueUserData = {
              ...userData,
              username: `${userData.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${userData.email}`
            };

            // Register user
            const registerResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueUserData);

            createdUser = registerResponse.body.user;
            const token = registerResponse.body.token;

            // Create requests concurrently
            const createPromises = collectionsData.map((collectionData, index) => {
              const uniqueCollectionData = {
                ...collectionData,
                pickupLocation: {
                  ...collectionData.pickupLocation,
                  address: `${collectionData.pickupLocation.address}_${index}_${Date.now()}`
                }
              };

              return request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${token}`)
                .send(uniqueCollectionData);
            });

            const responses = await Promise.all(createPromises);

            // Verify all requests were created successfully
            responses.forEach(response => {
              expect(response.status).toBe(201);
              expect(response.body.success).toBe(true);
              createdRequests.push(response.body.request);
            });

            // Verify unique identifiers
            const requestIds = createdRequests.map(req => req._id);
            const uniqueIds = new Set(requestIds);
            expect(uniqueIds.size).toBe(createdRequests.length);

            // Verify all have pending status and correct requester
            createdRequests.forEach(req => {
              expect(req.status).toBe('pending');
              expect(req.requesterId._id).toBe(createdUser._id);
            });

          } finally {
            // Clean up
            for (const req of createdRequests) {
              await CollectionRequest.findByIdAndDelete(req._id);
            }
            if (createdUser) {
              await User.findByIdAndDelete(createdUser._id);
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should reject unauthorized collection request creation', async () => {
    await fc.assert(
      fc.asyncProperty(validCollectionRequestArbitrary, async (collectionData) => {
        // Try to create collection request without authentication
        const response = await request(app)
          .post('/api/collections')
          .send(collectionData);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  test('should only allow residents and admins to create collection requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCollectionRequestArbitrary,
        async (collectionData) => {
          let createdUser = null;

          try {
            // Create collector user (should not be able to create requests)
            const collectorData = {
              username: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `collector_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
              password: 'Password123',
              role: 'collector'
            };

            const registerResponse = await request(app)
              .post('/api/auth/register')
              .send(collectorData);

            createdUser = registerResponse.body.user;
            const token = registerResponse.body.token;

            // Try to create collection request as collector
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${token}`)
              .send(collectionData);

            expect(collectionResponse.status).toBe(403);
            expect(collectionResponse.body.success).toBe(false);

          } finally {
            // Clean up
            if (createdUser) {
              await User.findByIdAndDelete(createdUser._id);
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});