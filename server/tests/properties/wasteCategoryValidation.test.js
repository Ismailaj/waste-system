/**
 * Feature: waste-management-system, Property 6: Waste category validation
 * 
 * Property: For any waste category selection, only valid categories should be 
 * accepted while invalid categories are rejected
 * 
 * Validates: Requirements 2.2
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

describe('Property 6: Waste category validation', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  const validCategories = ['organic', 'recyclable', 'hazardous', 'general'];
  
  // Generator for valid collection request data with specific category
  const collectionRequestWithCategoryArbitrary = (category) => fc.record({
    wasteCategory: fc.constant(category),
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

  // Generator for invalid waste categories
  const invalidCategoryArbitrary = fc.oneof(
    fc.constant(''),
    fc.constant('invalid'),
    fc.constant('plastic'), // Not in valid list
    fc.constant('metal'), // Not in valid list
    fc.constant('electronic'), // Not in valid list
    fc.constant('ORGANIC'), // Case sensitive
    fc.constant('Recyclable'), // Case sensitive
    fc.string().filter(s => !validCategories.includes(s) && s.length > 0)
  );

  // Generator for valid user data
  const validUserArbitrary = fc.record({
    username: fc.string({ minLength: 3, maxLength: 30 })
      .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 6, maxLength: 50 })
      .filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s)),
    role: fc.constantFrom('resident', 'admin')
  });

  test('should accept all valid waste categories', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        fc.constantFrom(...validCategories),
        async (userData, validCategory) => {
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

            createdUser = registerResponse.body.user;
            const token = registerResponse.body.token;

            // Create collection request with valid category
            const collectionData = {
              wasteCategory: validCategory,
              pickupLocation: {
                address: `Test Address ${Date.now()}`,
                coordinates: { lat: 40.7128, lng: -74.0060 },
                instructions: 'Test instructions'
              },
              notes: 'Test notes'
            };

            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${token}`)
              .send(collectionData);

            expect(collectionResponse.status).toBe(201);
            expect(collectionResponse.body.success).toBe(true);
            expect(collectionResponse.body.request.wasteCategory).toBe(validCategory);

            createdRequest = collectionResponse.body.request;

            // Verify category is stored correctly in database
            const storedRequest = await CollectionRequest.findById(createdRequest._id);
            expect(storedRequest.wasteCategory).toBe(validCategory);

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

  test('should reject invalid waste categories', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        invalidCategoryArbitrary,
        async (userData, invalidCategory) => {
          let createdUser = null;

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

            // Try to create collection request with invalid category
            const collectionData = {
              wasteCategory: invalidCategory,
              pickupLocation: {
                address: `Test Address ${Date.now()}`,
                coordinates: { lat: 40.7128, lng: -74.0060 }
              }
            };

            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${token}`)
              .send(collectionData);

            // Should reject invalid category
            expect(collectionResponse.status).toBeGreaterThanOrEqual(400);
            expect(collectionResponse.body.success).toBe(false);

            // Verify no collection request was created
            if (collectionResponse.body.request && collectionResponse.body.request._id) {
              const storedRequest = await CollectionRequest.findById(collectionResponse.body.request._id);
              expect(storedRequest).toBeNull();
            }

          } finally {
            // Clean up
            if (createdUser) {
              await User.findByIdAndDelete(createdUser._id);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should validate category case sensitivity', async () => {
    let createdUser = null;

    try {
      // Create user
      const userData = {
        username: `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
        password: 'Password123',
        role: 'resident'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      createdUser = registerResponse.body.user;
      const token = registerResponse.body.token;

      // Test case variations of valid categories
      const caseVariations = [
        'ORGANIC',
        'Organic',
        'OrGaNiC',
        'RECYCLABLE',
        'Recyclable',
        'RecYcLaBlE',
        'HAZARDOUS',
        'Hazardous',
        'HaZaRdOuS',
        'GENERAL',
        'General',
        'GeNeRaL'
      ];

      for (const category of caseVariations) {
        const collectionData = {
          wasteCategory: category,
          pickupLocation: {
            address: `Test Address ${Date.now()}_${category}`,
            coordinates: { lat: 40.7128, lng: -74.0060 }
          }
        };

        const response = await request(app)
          .post('/api/collections')
          .set('Authorization', `Bearer ${token}`)
          .send(collectionData);

        // Should reject case variations (categories are case-sensitive)
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.success).toBe(false);
      }

    } finally {
      // Clean up
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id);
      }
    }
  });

  test('should handle missing waste category', async () => {
    let createdUser = null;

    try {
      // Create user
      const userData = {
        username: `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
        password: 'Password123',
        role: 'resident'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      createdUser = registerResponse.body.user;
      const token = registerResponse.body.token;

      // Try to create collection request without waste category
      const collectionData = {
        pickupLocation: {
          address: `Test Address ${Date.now()}`,
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      };

      const response = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send(collectionData);

      // Should reject missing category
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);

    } finally {
      // Clean up
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id);
      }
    }
  });

  test('should validate category consistency across multiple requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        fc.array(fc.constantFrom(...validCategories), { minLength: 2, maxLength: 4 }),
        async (userData, categories) => {
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

            // Create multiple requests with different valid categories
            for (let i = 0; i < categories.length; i++) {
              const collectionData = {
                wasteCategory: categories[i],
                pickupLocation: {
                  address: `Test Address ${Date.now()}_${i}`,
                  coordinates: { lat: 40.7128 + i * 0.001, lng: -74.0060 + i * 0.001 }
                }
              };

              const response = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${token}`)
                .send(collectionData);

              expect(response.status).toBe(201);
              expect(response.body.success).toBe(true);
              expect(response.body.request.wasteCategory).toBe(categories[i]);

              createdRequests.push(response.body.request);
            }

            // Verify all categories are stored correctly
            for (let i = 0; i < createdRequests.length; i++) {
              const storedRequest = await CollectionRequest.findById(createdRequests[i]._id);
              expect(storedRequest.wasteCategory).toBe(categories[i]);
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
});