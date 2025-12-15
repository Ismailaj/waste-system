/**
 * Feature: waste-management-system, Property 7: Location data persistence
 * 
 * Property: For any pickup location details, the location information should be 
 * accurately stored and retrievable with the Collection_Request
 * 
 * Validates: Requirements 2.3
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

describe('Property 7: Location data persistence', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // Generator for valid location data
  const validLocationArbitrary = fc.record({
    address: fc.string({ minLength: 5, maxLength: 200 }),
    coordinates: fc.record({
      lat: fc.float({ min: -90, max: 90 }),
      lng: fc.float({ min: -180, max: 180 })
    }),
    instructions: fc.option(fc.string({ maxLength: 500 }))
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

  test('should accurately store and retrieve location information', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validLocationArbitrary,
        async (userData, locationData) => {
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

            // Create collection request with location data
            const collectionData = {
              wasteCategory: 'general',
              pickupLocation: locationData,
              notes: 'Test location persistence'
            };

            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${token}`)
              .send(collectionData);

            expect(collectionResponse.status).toBe(201);
            expect(collectionResponse.body.success).toBe(true);

            createdRequest = collectionResponse.body.request;

            // Verify location data in response
            const responseLocation = createdRequest.pickupLocation;
            expect(responseLocation.address).toBe(locationData.address);
            
            if (locationData.coordinates) {
              expect(responseLocation.coordinates.lat).toBeCloseTo(locationData.coordinates.lat, 5);
              expect(responseLocation.coordinates.lng).toBeCloseTo(locationData.coordinates.lng, 5);
            }

            if (locationData.instructions) {
              expect(responseLocation.instructions).toBe(locationData.instructions);
            }

            // Verify location data is stored correctly in database
            const storedRequest = await CollectionRequest.findById(createdRequest._id);
            expect(storedRequest.pickupLocation.address).toBe(locationData.address);
            
            if (locationData.coordinates) {
              expect(storedRequest.pickupLocation.coordinates.lat).toBeCloseTo(locationData.coordinates.lat, 5);
              expect(storedRequest.pickupLocation.coordinates.lng).toBeCloseTo(locationData.coordinates.lng, 5);
            }

            if (locationData.instructions) {
              expect(storedRequest.pickupLocation.instructions).toBe(locationData.instructions);
            }

            // Verify location data is retrievable via API
            const getResponse = await request(app)
              .get(`/api/collections/${createdRequest._id}`)
              .set('Authorization', `Bearer ${token}`);

            expect(getResponse.status).toBe(200);
            const retrievedLocation = getResponse.body.request.pickupLocation;
            expect(retrievedLocation.address).toBe(locationData.address);
            
            if (locationData.coordinates) {
              expect(retrievedLocation.coordinates.lat).toBeCloseTo(locationData.coordinates.lat, 5);
              expect(retrievedLocation.coordinates.lng).toBeCloseTo(locationData.coordinates.lng, 5);
            }

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

  test('should handle edge cases in coordinate values', async () => {
    const edgeCaseCoordinates = [
      { lat: 90, lng: 180 },     // Maximum values
      { lat: -90, lng: -180 },   // Minimum values
      { lat: 0, lng: 0 },        // Zero values
      { lat: 45.123456789, lng: -122.987654321 }, // High precision
      { lat: 89.999999, lng: 179.999999 },       // Near maximum
      { lat: -89.999999, lng: -179.999999 }      // Near minimum
    ];

    let createdUser = null;
    const createdRequests = [];

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

      // Test each edge case coordinate
      for (let i = 0; i < edgeCaseCoordinates.length; i++) {
        const coordinates = edgeCaseCoordinates[i];
        const collectionData = {
          wasteCategory: 'general',
          pickupLocation: {
            address: `Edge Case Address ${i}`,
            coordinates: coordinates,
            instructions: `Edge case test ${i}`
          }
        };

        const response = await request(app)
          .post('/api/collections')
          .set('Authorization', `Bearer ${token}`)
          .send(collectionData);

        expect(response.status).toBe(201);
        createdRequests.push(response.body.request);

        // Verify coordinates are stored accurately
        const storedRequest = await CollectionRequest.findById(response.body.request._id);
        expect(storedRequest.pickupLocation.coordinates.lat).toBeCloseTo(coordinates.lat, 5);
        expect(storedRequest.pickupLocation.coordinates.lng).toBeCloseTo(coordinates.lng, 5);
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
  });

  test('should handle location data without coordinates', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        fc.record({
          address: fc.string({ minLength: 5, maxLength: 200 }),
          instructions: fc.option(fc.string({ maxLength: 500 }))
        }),
        async (userData, locationData) => {
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

            // Create collection request without coordinates
            const collectionData = {
              wasteCategory: 'general',
              pickupLocation: locationData
            };

            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${token}`)
              .send(collectionData);

            expect(collectionResponse.status).toBe(201);
            createdRequest = collectionResponse.body.request;

            // Verify address is stored
            expect(createdRequest.pickupLocation.address).toBe(locationData.address);
            
            // Verify coordinates are undefined/null
            expect(createdRequest.pickupLocation.coordinates).toBeUndefined();

            // Verify in database
            const storedRequest = await CollectionRequest.findById(createdRequest._id);
            expect(storedRequest.pickupLocation.address).toBe(locationData.address);

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
      { numRuns: 50 }
    );
  });

  test('should preserve location data integrity across updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validLocationArbitrary,
        async (userData, originalLocation) => {
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

            // Create collection request
            const collectionData = {
              wasteCategory: 'general',
              pickupLocation: originalLocation
            };

            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${token}`)
              .send(collectionData);

            createdRequest = collectionResponse.body.request;

            // Update request status (should not affect location data)
            const updateResponse = await request(app)
              .put(`/api/collections/${createdRequest._id}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ notes: 'Updated notes' });

            expect(updateResponse.status).toBe(200);

            // Verify location data is preserved
            const updatedRequest = updateResponse.body.request;
            expect(updatedRequest.pickupLocation.address).toBe(originalLocation.address);
            
            if (originalLocation.coordinates) {
              expect(updatedRequest.pickupLocation.coordinates.lat).toBeCloseTo(originalLocation.coordinates.lat, 5);
              expect(updatedRequest.pickupLocation.coordinates.lng).toBeCloseTo(originalLocation.coordinates.lng, 5);
            }

            if (originalLocation.instructions) {
              expect(updatedRequest.pickupLocation.instructions).toBe(originalLocation.instructions);
            }

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
      { numRuns: 50 }
    );
  });

  test('should handle special characters in address and instructions', async () => {
    const specialCharacterTests = [
      {
        address: "123 Main St. Apt #4B, City, State 12345",
        instructions: "Ring bell twice & wait at door"
      },
      {
        address: "Café Münchën, Straße 42, 80331 München",
        instructions: "Entrée par la porte arrière"
      },
      {
        address: "東京都渋谷区渋谷1-1-1",
        instructions: "エレベーターで3階まで"
      },
      {
        address: "123 O'Connor St., Apt. 5A",
        instructions: "Don't ring bell - baby sleeping!"
      }
    ];

    let createdUser = null;
    const createdRequests = [];

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

      // Test each special character case
      for (let i = 0; i < specialCharacterTests.length; i++) {
        const locationData = specialCharacterTests[i];
        const collectionData = {
          wasteCategory: 'general',
          pickupLocation: {
            ...locationData,
            coordinates: { lat: 40.7128 + i * 0.001, lng: -74.0060 + i * 0.001 }
          }
        };

        const response = await request(app)
          .post('/api/collections')
          .set('Authorization', `Bearer ${token}`)
          .send(collectionData);

        expect(response.status).toBe(201);
        createdRequests.push(response.body.request);

        // Verify special characters are preserved
        expect(response.body.request.pickupLocation.address).toBe(locationData.address);
        expect(response.body.request.pickupLocation.instructions).toBe(locationData.instructions);

        // Verify in database
        const storedRequest = await CollectionRequest.findById(response.body.request._id);
        expect(storedRequest.pickupLocation.address).toBe(locationData.address);
        expect(storedRequest.pickupLocation.instructions).toBe(locationData.instructions);
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
  });
});