/**
 * Feature: waste-management-system, Property 15: User deletion preserves historical data
 * 
 * Property: For any user account deletion by an administrator, the user should be 
 * removed while all historical collection data remains intact
 * 
 * Validates: Requirements 4.5
 */

import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { User, CollectionRequest } from '../../models/index.js';
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

describe('Property 15: User deletion preserves historical data', () => {
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

  test('should preserve collection data when deleting resident user', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 2, maxLength: 4 }),
        async (adminData, residentData, collectionsData) => {
          let admin = null;
          let resident = null;
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

            // Register users
            const adminRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueAdminData);

            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            admin = adminRegResponse.body.user;
            resident = residentRegResponse.body.user;
            const adminToken = adminRegResponse.body.token;
            const residentToken = residentRegResponse.body.token;

            // Create collection requests
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `UserDeletion_${i}_${Date.now()}_${collectionsData[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              expect(collectionResponse.status).toBe(201);
              collections.push(collectionResponse.body.request);
            }

            // Verify collections exist before deletion
            const preDeleteCollections = await CollectionRequest.find({
              requesterId: resident._id
            });
            expect(preDeleteCollections).toHaveLength(collections.length);

            // Delete user via admin
            const deleteResponse = await request(app)
              .delete(`/api/admin/users/${resident._id}`)
              .set('Authorization', `Bearer ${adminToken}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.success).toBe(true);

            // Verify user is deleted
            const deletedUser = await User.findById(resident._id);
            expect(deletedUser).toBeNull();

            // Verify collections are preserved
            const postDeleteCollections = await CollectionRequest.find({
              _id: { $in: collections.map(c => c._id) }
            });
            expect(postDeleteCollections).toHaveLength(collections.length);

            // Verify collection data integrity
            postDeleteCollections.forEach((collection, index) => {
              expect(collection.wasteCategory).toBe(collectionsData[index].wasteCategory);
              expect(collection.pickupLocation.address).toContain('UserDeletion_');
              expect(collection.requesterId.toString()).toBe(resident._id); // Reference preserved
            });

            // Verify collections are still accessible via admin
            const adminViewResponse = await request(app)
              .get('/api/collections')
              .set('Authorization', `Bearer ${adminToken}`);

            expect(adminViewResponse.status).toBe(200);
            const adminCollections = adminViewResponse.body.requests;
            
            // Should include the orphaned collections
            const orphanedCollections = adminCollections.filter(c => 
              collections.some(orig => orig._id === c._id)
            );
            expect(orphanedCollections).toHaveLength(collections.length);

          } finally {
            // Clean up
            for (const collection of collections) {
              await CollectionRequest.findByIdAndDelete(collection._id);
            }
            if (admin) {
              await User.findByIdAndDelete(admin._id);
            }
            // Resident should already be deleted by the test
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should preserve collection assignments when deleting collector user', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validUserArbitrary,
        fc.array(validCollectionArbitrary, { minLength: 2, maxLength: 3 }),
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

            // Create and assign collections
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = {
                ...collectionsData[i],
                pickupLocation: {
                  ...collectionsData[i].pickupLocation,
                  address: `CollectorDeletion_${i}_${Date.now()}_${collectionsData[i].pickupLocation.address}`
                }
              };

              const collectionResponse = await request(app)
                .post('/api/collections')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(collectionData);

              const collection = collectionResponse.body.request;
              collections.push(collection);

              // Assign to collector
              await CollectionRequest.findByIdAndUpdate(collection._id, {
                assignedCollector: collector._id,
                status: 'assigned'
              });
            }

            // Verify assignments before deletion
            const preDeleteCollections = await CollectionRequest.find({
              assignedCollector: collector._id
            });
            expect(preDeleteCollections).toHaveLength(collections.length);

            // Delete collector via admin
            const deleteResponse = await request(app)
              .delete(`/api/admin/users/${collector._id}`)
              .set('Authorization', `Bearer ${adminToken}`);

            expect(deleteResponse.status).toBe(200);

            // Verify collector is deleted
            const deletedCollector = await User.findById(collector._id);
            expect(deletedCollector).toBeNull();

            // Verify collections are preserved with assignment history
            const postDeleteCollections = await CollectionRequest.find({
              _id: { $in: collections.map(c => c._id) }
            });
            expect(postDeleteCollections).toHaveLength(collections.length);

            // Verify assignment references are preserved
            postDeleteCollections.forEach(collection => {
              expect(collection.assignedCollector.toString()).toBe(collector._id);
              expect(collection.status).toBe('assigned'); // Status preserved
            });

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
            // Collector should already be deleted by the test
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should maintain data integrity across multiple user deletions', async () => {
    let admin = null;
    let residents = [];
    let collectors = [];
    let allCollections = [];

    try {
      // Create admin
      const adminData = {
        username: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
        password: 'AdminPass123',
        role: 'admin'
      };

      const adminRegResponse = await request(app)
        .post('/api/auth/register')
        .send(adminData);

      admin = adminRegResponse.body.user;
      const adminToken = adminRegResponse.body.token;

      // Create multiple residents and collectors
      for (let i = 0; i < 3; i++) {
        // Create resident
        const residentData = {
          username: `resident_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          email: `resident_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
          password: 'ResidentPass123',
          role: 'resident'
        };

        const residentRegResponse = await request(app)
          .post('/api/auth/register')
          .send(residentData);

        residents.push({
          user: residentRegResponse.body.user,
          token: residentRegResponse.body.token
        });

        // Create collector
        const collectorData = {
          username: `collector_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          email: `collector_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
          password: 'CollectorPass123',
          role: 'collector'
        };

        const collectorRegResponse = await request(app)
          .post('/api/auth/register')
          .send(collectorData);

        collectors.push(collectorRegResponse.body.user);
      }

      // Create collections for each resident
      for (let i = 0; i < residents.length; i++) {
        const resident = residents[i];
        
        for (let j = 0; j < 2; j++) {
          const collectionData = {
            wasteCategory: 'general',
            pickupLocation: {
              address: `MultiDelete_${i}_${j}_${Date.now()}`,
              coordinates: { lat: 40.7128 + i * 0.001, lng: -74.0060 + j * 0.001 }
            }
          };

          const collectionResponse = await request(app)
            .post('/api/collections')
            .set('Authorization', `Bearer ${resident.token}`)
            .send(collectionData);

          const collection = collectionResponse.body.request;
          allCollections.push(collection);

          // Assign to collector
          await CollectionRequest.findByIdAndUpdate(collection._id, {
            assignedCollector: collectors[i]._id,
            status: 'assigned'
          });
        }
      }

      // Verify initial state
      expect(allCollections).toHaveLength(6); // 3 residents × 2 collections each

      // Delete some users
      const usersToDelete = [residents[0].user, collectors[1]];
      
      for (const user of usersToDelete) {
        const deleteResponse = await request(app)
          .delete(`/api/admin/users/${user._id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(deleteResponse.status).toBe(200);
      }

      // Verify users are deleted
      for (const user of usersToDelete) {
        const deletedUser = await User.findById(user._id);
        expect(deletedUser).toBeNull();
      }

      // Verify all collections are preserved
      const preservedCollections = await CollectionRequest.find({
        _id: { $in: allCollections.map(c => c._id) }
      });
      expect(preservedCollections).toHaveLength(allCollections.length);

      // Verify data integrity
      preservedCollections.forEach(collection => {
        expect(collection.pickupLocation.address).toContain('MultiDelete_');
        expect(collection.requesterId).toBeDefined();
        expect(collection.assignedCollector).toBeDefined();
      });

      // Verify admin can still access all data
      const adminViewResponse = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminViewResponse.status).toBe(200);
      const adminCollections = adminViewResponse.body.requests;
      
      const testCollections = adminCollections.filter(c => 
        c.pickupLocation.address.includes('MultiDelete_')
      );
      expect(testCollections).toHaveLength(allCollections.length);

    } finally {
      // Clean up
      for (const collection of allCollections) {
        await CollectionRequest.findByIdAndDelete(collection._id);
      }
      if (admin) {
        await User.findByIdAndDelete(admin._id);
      }
      for (const resident of residents) {
        await User.findByIdAndDelete(resident.user._id);
      }
      for (const collector of collectors) {
        await User.findByIdAndDelete(collector._id);
      }
    }
  });

  test('should prevent non-admin users from deleting accounts', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        async (resident1Data, resident2Data) => {
          let resident1 = null;
          let resident2 = null;

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

            // Resident1 tries to delete resident2
            const unauthorizedDeleteResponse = await request(app)
              .delete(`/api/admin/users/${resident2._id}`)
              .set('Authorization', `Bearer ${resident1Token}`);

            expect(unauthorizedDeleteResponse.status).toBe(403);
            expect(unauthorizedDeleteResponse.body.success).toBe(false);

            // Verify resident2 still exists
            const stillExistingUser = await User.findById(resident2._id);
            expect(stillExistingUser).toBeDefined();
            expect(stillExistingUser.username).toBe(uniqueResident2Data.username);

          } finally {
            // Clean up
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
});