/**
 * Feature: waste-management-system, Property 11: Authorization enforcement
 * 
 * Property: For any attempt to update a collection by a non-assigned collector, 
 * the system should prevent the update and display an authorization error
 * 
 * Validates: Requirements 3.5
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

describe('Property 11: Authorization enforcement', () => {
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

  test('should prevent non-assigned collectors from updating collections', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validUserArbitrary,
        validCollectionArbitrary,
        async (residentData, assignedCollectorData, unauthorizedCollectorData, collectionData) => {
          let resident = null;
          let assignedCollector = null;
          let unauthorizedCollector = null;
          let collection = null;

          try {
            // Create unique users
            const uniqueResidentData = {
              ...residentData,
              role: 'resident',
              username: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}_${residentData.email}`
            };

            const uniqueAssignedCollectorData = {
              ...assignedCollectorData,
              role: 'collector',
              username: `assigned_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `assigned_${Date.now()}_${Math.random().toString(36).substring(7)}_${assignedCollectorData.email}`
            };

            const uniqueUnauthorizedCollectorData = {
              ...unauthorizedCollectorData,
              role: 'collector',
              username: `unauthorized_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `unauthorized_${Date.now()}_${Math.random().toString(36).substring(7)}_${unauthorizedCollectorData.email}`
            };

            // Register users
            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            const assignedCollectorRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueAssignedCollectorData);

            const unauthorizedCollectorRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueUnauthorizedCollectorData);

            resident = residentRegResponse.body.user;
            assignedCollector = assignedCollectorRegResponse.body.user;
            unauthorizedCollector = unauthorizedCollectorRegResponse.body.user;
            
            const residentToken = residentRegResponse.body.token;
            const assignedCollectorToken = assignedCollectorRegResponse.body.token;
            const unauthorizedCollectorToken = unauthorizedCollectorRegResponse.body.token;

            // Create collection request
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${residentToken}`)
              .send(collectionData);

            collection = collectionResponse.body.request;

            // Assign collection to the assigned collector
            await CollectionRequest.findByIdAndUpdate(collection._id, {
              assignedCollector: assignedCollector._id,
              status: 'assigned'
            });

            // Test 1: Assigned collector should be able to update
            const authorizedUpdateResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${assignedCollectorToken}`)
              .send({ status: 'in-progress' });

            expect(authorizedUpdateResponse.status).toBe(200);
            expect(authorizedUpdateResponse.body.success).toBe(true);

            // Test 2: Non-assigned collector should be denied
            const unauthorizedUpdateResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${unauthorizedCollectorToken}`)
              .send({ status: 'completed' });

            expect(unauthorizedUpdateResponse.status).toBe(403);
            expect(unauthorizedUpdateResponse.body.success).toBe(false);
            expect(unauthorizedUpdateResponse.body.message).toContain('Access denied');

            // Verify collection status wasn't changed by unauthorized update
            const verificationResponse = await request(app)
              .get(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${assignedCollectorToken}`);

            expect(verificationResponse.status).toBe(200);
            expect(verificationResponse.body.request.status).toBe('in-progress'); // Should still be in-progress

          } finally {
            // Clean up
            if (collection) {
              await CollectionRequest.findByIdAndDelete(collection._id);
            }
            if (resident) {
              await User.findByIdAndDelete(resident._id);
            }
            if (assignedCollector) {
              await User.findByIdAndDelete(assignedCollector._id);
            }
            if (unauthorizedCollector) {
              await User.findByIdAndDelete(unauthorizedCollector._id);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should prevent residents from updating collections after assignment', async () => {
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
            const residentToken = residentRegResponse.body.token;

            // Create collection request
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${residentToken}`)
              .send(collectionData);

            collection = collectionResponse.body.request;

            // Resident should be able to update while pending
            const pendingUpdateResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${residentToken}`)
              .send({ notes: 'Updated while pending' });

            expect(pendingUpdateResponse.status).toBe(200);

            // Assign collection to collector
            await CollectionRequest.findByIdAndUpdate(collection._id, {
              assignedCollector: collector._id,
              status: 'assigned'
            });

            // Resident should NOT be able to update after assignment
            const assignedUpdateResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${residentToken}`)
              .send({ notes: 'Trying to update after assignment' });

            expect(assignedUpdateResponse.status).toBe(403);
            expect(assignedUpdateResponse.body.success).toBe(false);

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
      { numRuns: 50 }
    );
  });

  test('should allow admins to update any collection regardless of assignment', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validUserArbitrary,
        validCollectionArbitrary,
        async (residentData, collectorData, adminData, collectionData) => {
          let resident = null;
          let collector = null;
          let admin = null;
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

            const uniqueAdminData = {
              ...adminData,
              role: 'admin',
              username: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}_${adminData.email}`
            };

            // Register users
            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            const collectorRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCollectorData);

            const adminRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueAdminData);

            resident = residentRegResponse.body.user;
            collector = collectorRegResponse.body.user;
            admin = adminRegResponse.body.user;
            
            const residentToken = residentRegResponse.body.token;
            const adminToken = adminRegResponse.body.token;

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

            // Admin should be able to update any collection
            const adminUpdateResponse = await request(app)
              .put(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ status: 'in-progress', notes: 'Admin override' });

            expect(adminUpdateResponse.status).toBe(200);
            expect(adminUpdateResponse.body.success).toBe(true);
            expect(adminUpdateResponse.body.request.status).toBe('in-progress');

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
            if (admin) {
              await User.findByIdAndDelete(admin._id);
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should prevent unauthorized access to collection details', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        validUserArbitrary,
        validCollectionArbitrary,
        async (residentData, unauthorizedUserData, collectionData) => {
          let resident = null;
          let unauthorizedUser = null;
          let collection = null;

          try {
            // Create unique users
            const uniqueResidentData = {
              ...residentData,
              role: 'resident',
              username: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `resident_${Date.now()}_${Math.random().toString(36).substring(7)}_${residentData.email}`
            };

            const uniqueUnauthorizedUserData = {
              ...unauthorizedUserData,
              role: 'resident',
              username: `unauthorized_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `unauthorized_${Date.now()}_${Math.random().toString(36).substring(7)}_${unauthorizedUserData.email}`
            };

            // Register users
            const residentRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueResidentData);

            const unauthorizedUserRegResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueUnauthorizedUserData);

            resident = residentRegResponse.body.user;
            unauthorizedUser = unauthorizedUserRegResponse.body.user;
            
            const residentToken = residentRegResponse.body.token;
            const unauthorizedToken = unauthorizedUserRegResponse.body.token;

            // Create collection request
            const collectionResponse = await request(app)
              .post('/api/collections')
              .set('Authorization', `Bearer ${residentToken}`)
              .send(collectionData);

            collection = collectionResponse.body.request;

            // Unauthorized user should not be able to view collection details
            const unauthorizedViewResponse = await request(app)
              .get(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${unauthorizedToken}`);

            expect(unauthorizedViewResponse.status).toBe(403);
            expect(unauthorizedViewResponse.body.success).toBe(false);

            // Original resident should be able to view their own collection
            const authorizedViewResponse = await request(app)
              .get(`/api/collections/${collection._id}`)
              .set('Authorization', `Bearer ${residentToken}`);

            expect(authorizedViewResponse.status).toBe(200);
            expect(authorizedViewResponse.body.success).toBe(true);

          } finally {
            // Clean up
            if (collection) {
              await CollectionRequest.findByIdAndDelete(collection._id);
            }
            if (resident) {
              await User.findByIdAndDelete(resident._id);
            }
            if (unauthorizedUser) {
              await User.findByIdAndDelete(unauthorizedUser._id);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});