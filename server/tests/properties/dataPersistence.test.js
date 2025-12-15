/**
 * Feature: waste-management-system, Property 19: Data persistence and consistency
 * 
 * Property: For any collection data operation, the information should be 
 * immediately stored in MongoDB and maintain consistency across all related operations
 * 
 * Validates: Requirements 6.1, 6.4
 */

import fc from 'fast-check';
import { User, CollectionRequest, CollectionRoute } from '../../models/index.js';

describe('Property 19: Data persistence and consistency', () => {
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
    password: fc.string({ minLength: 6, maxLength: 50 }),
    role: fc.constantFrom('resident', 'collector', 'admin')
  });

  test('should immediately store collection data in MongoDB', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validCollectionRequestArbitrary,
        async (userData, collectionData) => {
          let createdUser = null;
          let createdRequest = null;

          try {
            // Create a unique user for this test
            const uniqueUserData = {
              ...userData,
              username: `${userData.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${userData.email}`
            };

            // Create user first
            createdUser = await User.create(uniqueUserData);
            expect(createdUser._id).toBeDefined();

            // Create collection request
            const requestData = {
              ...collectionData,
              requesterId: createdUser._id
            };

            createdRequest = await CollectionRequest.create(requestData);

            // Verify immediate storage - data should be retrievable immediately
            const retrievedRequest = await CollectionRequest.findById(createdRequest._id);
            expect(retrievedRequest).toBeDefined();
            expect(retrievedRequest._id.toString()).toBe(createdRequest._id.toString());

            // Verify data consistency
            expect(retrievedRequest.requesterId.toString()).toBe(createdUser._id.toString());
            expect(retrievedRequest.wasteCategory).toBe(collectionData.wasteCategory);
            expect(retrievedRequest.pickupLocation.address).toBe(collectionData.pickupLocation.address);
            expect(retrievedRequest.status).toBe('pending'); // Default status

            // Verify coordinates are stored correctly
            if (collectionData.pickupLocation.coordinates) {
              expect(retrievedRequest.pickupLocation.coordinates.lat).toBeCloseTo(
                collectionData.pickupLocation.coordinates.lat, 5
              );
              expect(retrievedRequest.pickupLocation.coordinates.lng).toBeCloseTo(
                collectionData.pickupLocation.coordinates.lng, 5
              );
            }

            // Verify timestamps are set
            expect(retrievedRequest.createdAt).toBeDefined();
            expect(retrievedRequest.updatedAt).toBeDefined();

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

  test('should maintain consistency across related operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validCollectionRequestArbitrary,
        async (residentData, collectorData, collectionData) => {
          let resident = null;
          let collector = null;
          let collectionRequest = null;
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

            // Create users
            resident = await User.create(uniqueResidentData);
            collector = await User.create(uniqueCollectorData);

            // Create collection request
            const requestData = {
              ...collectionData,
              requesterId: resident._id
            };
            collectionRequest = await CollectionRequest.create(requestData);

            // Assign collector and update status
            collectionRequest.assignedCollector = collector._id;
            collectionRequest.status = 'assigned';
            await collectionRequest.save();

            // Create route for collector
            const routeData = {
              collectorId: collector._id,
              date: new Date(),
              collections: [collectionRequest._id],
              status: 'planned'
            };
            route = await CollectionRoute.create(routeData);

            // Verify consistency across all related documents
            
            // 1. Verify collection request is properly linked
            const retrievedRequest = await CollectionRequest.findById(collectionRequest._id)
              .populate('requesterId')
              .populate('assignedCollector');
            
            expect(retrievedRequest.requesterId._id.toString()).toBe(resident._id.toString());
            expect(retrievedRequest.assignedCollector._id.toString()).toBe(collector._id.toString());
            expect(retrievedRequest.status).toBe('assigned');

            // 2. Verify route contains the collection
            const retrievedRoute = await CollectionRoute.findById(route._id)
              .populate('collections');
            
            expect(retrievedRoute.collectorId.toString()).toBe(collector._id.toString());
            expect(retrievedRoute.collections).toHaveLength(1);
            expect(retrievedRoute.collections[0]._id.toString()).toBe(collectionRequest._id.toString());

            // 3. Verify data integrity after updates
            collectionRequest.status = 'completed';
            await collectionRequest.save();

            const updatedRequest = await CollectionRequest.findById(collectionRequest._id);
            expect(updatedRequest.status).toBe('completed');
            expect(updatedRequest.completedDate).toBeDefined();

            // 4. Verify all timestamps are properly maintained
            expect(updatedRequest.updatedAt.getTime()).toBeGreaterThan(updatedRequest.createdAt.getTime());

          } finally {
            // Clean up in reverse order to maintain referential integrity
            if (route) {
              await CollectionRoute.findByIdAndDelete(route._id);
            }
            if (collectionRequest) {
              await CollectionRequest.findByIdAndDelete(collectionRequest._id);
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
      { numRuns: 50 } // Fewer runs for this complex test
    );
  });

  test('should handle concurrent operations while maintaining consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validCollectionRequestArbitrary, { minLength: 2, maxLength: 5 }),
        async (collectionsData) => {
          let resident = null;
          const createdRequests = [];

          try {
            // Create a resident user
            const residentData = {
              username: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
              password: 'password123',
              role: 'resident'
            };
            resident = await User.create(residentData);

            // Create multiple collection requests concurrently
            const createPromises = collectionsData.map(async (collectionData, index) => {
              const requestData = {
                ...collectionData,
                requesterId: resident._id,
                pickupLocation: {
                  ...collectionData.pickupLocation,
                  address: `${collectionData.pickupLocation.address}_${index}` // Make addresses unique
                }
              };
              return CollectionRequest.create(requestData);
            });

            const results = await Promise.all(createPromises);
            createdRequests.push(...results);

            // Verify all requests were created successfully
            expect(createdRequests).toHaveLength(collectionsData.length);

            // Verify each request has unique ID and correct data
            const requestIds = new Set();
            for (let i = 0; i < createdRequests.length; i++) {
              const request = createdRequests[i];
              const originalData = collectionsData[i];

              // Check uniqueness
              expect(requestIds.has(request._id.toString())).toBe(false);
              requestIds.add(request._id.toString());

              // Check data integrity
              expect(request.requesterId.toString()).toBe(resident._id.toString());
              expect(request.wasteCategory).toBe(originalData.wasteCategory);
              expect(request.status).toBe('pending');
            }

            // Verify all requests can be retrieved
            const retrievedRequests = await CollectionRequest.find({ requesterId: resident._id });
            expect(retrievedRequests).toHaveLength(collectionsData.length);

          } finally {
            // Clean up
            for (const request of createdRequests) {
              await CollectionRequest.findByIdAndDelete(request._id);
            }
            if (resident) {
              await User.findByIdAndDelete(resident._id);
            }
          }
        }
      ),
      { numRuns: 30 } // Fewer runs for concurrent operations test
    );
  });
});