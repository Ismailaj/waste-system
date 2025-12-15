/**
 * Feature: waste-management-system, Property 2: Authentication round trip
 * 
 * Property: For any registered user, providing their correct credentials should 
 * grant system access, while incorrect credentials should be rejected
 * 
 * Validates: Requirements 1.2, 1.3
 */

import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import User from '../../models/User.js';
import userRoutes from '../../routes/userRoutes.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', userRoutes);
  return app;
};

describe('Property 2: Authentication round trip', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // Generator for valid user credentials
  const validCredentialsArbitrary = fc.record({
    username: fc.string({ minLength: 3, maxLength: 30 })
      .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 6, maxLength: 50 })
      .filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s)), // Must contain lower, upper, and digit
    role: fc.constantFrom('resident', 'collector', 'admin')
  });

  test('should grant access for correct credentials and reject incorrect ones', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
        let createdUser = null;

        try {
          // Make credentials unique for this test run
          const uniqueCredentials = {
            ...credentials,
            username: `${credentials.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${credentials.email}`
          };

          // 1. Register user
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(uniqueCredentials);

          expect(registerResponse.status).toBe(201);
          expect(registerResponse.body.success).toBe(true);
          expect(registerResponse.body.token).toBeDefined();
          expect(registerResponse.body.user.email).toBe(uniqueCredentials.email);

          createdUser = registerResponse.body.user;

          // 2. Test correct credentials - should grant access
          const correctLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: uniqueCredentials.email,
              password: uniqueCredentials.password
            });

          expect(correctLoginResponse.status).toBe(200);
          expect(correctLoginResponse.body.success).toBe(true);
          expect(correctLoginResponse.body.token).toBeDefined();
          expect(correctLoginResponse.body.user.email).toBe(uniqueCredentials.email);
          expect(correctLoginResponse.body.user.role).toBe(uniqueCredentials.role);

          // 3. Test incorrect password - should reject
          const wrongPasswordResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: uniqueCredentials.email,
              password: 'WrongPassword123'
            });

          expect(wrongPasswordResponse.status).toBe(401);
          expect(wrongPasswordResponse.body.success).toBe(false);
          expect(wrongPasswordResponse.body.token).toBeUndefined();

          // 4. Test incorrect email - should reject
          const wrongEmailResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'wrong@email.com',
              password: uniqueCredentials.password
            });

          expect(wrongEmailResponse.status).toBe(401);
          expect(wrongEmailResponse.body.success).toBe(false);
          expect(wrongEmailResponse.body.token).toBeUndefined();

          // 5. Test using token for authenticated access
          const profileResponse = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${correctLoginResponse.body.token}`);

          expect(profileResponse.status).toBe(200);
          expect(profileResponse.body.success).toBe(true);
          expect(profileResponse.body.user.email).toBe(uniqueCredentials.email);

          // 6. Test access without token - should reject
          const noTokenResponse = await request(app)
            .get('/api/auth/profile');

          expect(noTokenResponse.status).toBe(401);
          expect(noTokenResponse.body.success).toBe(false);

        } finally {
          // Clean up
          if (createdUser) {
            await User.findByIdAndDelete(createdUser._id);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  test('should handle various invalid credential formats', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCredentialsArbitrary,
        fc.oneof(
          fc.constant(''), // Empty password
          fc.string({ maxLength: 5 }), // Too short password
          fc.string().filter(s => !/[A-Z]/.test(s)), // No uppercase
          fc.string().filter(s => !/[a-z]/.test(s)), // No lowercase
          fc.string().filter(s => !/\d/.test(s)) // No digit
        ),
        async (validCredentials, invalidPassword) => {
          let createdUser = null;

          try {
            // Create a valid user first
            const uniqueCredentials = {
              ...validCredentials,
              username: `${validCredentials.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${validCredentials.email}`
            };

            const registerResponse = await request(app)
              .post('/api/auth/register')
              .send(uniqueCredentials);

            expect(registerResponse.status).toBe(201);
            createdUser = registerResponse.body.user;

            // Try to login with invalid password
            const loginResponse = await request(app)
              .post('/api/auth/login')
              .send({
                email: uniqueCredentials.email,
                password: invalidPassword
              });

            // Should reject invalid credentials
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.body.success).toBe(false);
            expect(loginResponse.body.token).toBeUndefined();

          } finally {
            // Clean up
            if (createdUser) {
              await User.findByIdAndDelete(createdUser._id);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should maintain session consistency across multiple requests', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
        let createdUser = null;

        try {
          // Create unique credentials
          const uniqueCredentials = {
            ...credentials,
            username: `${credentials.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${credentials.email}`
          };

          // Register user
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(uniqueCredentials);

          createdUser = registerResponse.body.user;
          const token = registerResponse.body.token;

          // Make multiple authenticated requests
          const requests = [
            request(app).get('/api/auth/profile').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/auth/profile').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/auth/profile').set('Authorization', `Bearer ${token}`)
          ];

          const responses = await Promise.all(requests);

          // All requests should succeed with same user data
          responses.forEach(response => {
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe(uniqueCredentials.email);
            expect(response.body.user._id).toBe(createdUser._id);
          });

          // Test logout
          const logoutResponse = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

          expect(logoutResponse.status).toBe(200);
          expect(logoutResponse.body.success).toBe(true);

        } finally {
          // Clean up
          if (createdUser) {
            await User.findByIdAndDelete(createdUser._id);
          }
        }
      }),
      { numRuns: 30 }
    );
  });
});