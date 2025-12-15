/**
 * Feature: waste-management-system, Property 4: Input validation rejection
 * 
 * Property: For any invalid or incomplete form data (registration, collection requests), 
 * the system should reject the submission and display appropriate validation errors
 * 
 * Validates: Requirements 1.5, 2.5
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

describe('Property 4: Input validation rejection', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // Generator for invalid registration data
  const invalidRegistrationArbitrary = fc.oneof(
    // Invalid username
    fc.record({
      username: fc.oneof(
        fc.constant(''), // Empty username
        fc.string({ maxLength: 2 }), // Too short
        fc.string({ minLength: 31 }), // Too long
        fc.string().filter(s => /[^a-zA-Z0-9_-]/.test(s)) // Invalid characters
      ),
      email: fc.emailAddress(),
      password: fc.string({ minLength: 6 }).filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s)),
      role: fc.constantFrom('resident', 'collector', 'admin')
    }),
    // Invalid email
    fc.record({
      username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
      email: fc.oneof(
        fc.constant(''), // Empty email
        fc.constant('invalid-email'), // Invalid format
        fc.constant('missing@'), // Missing domain
        fc.constant('@missing.com') // Missing local part
      ),
      password: fc.string({ minLength: 6 }).filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s)),
      role: fc.constantFrom('resident', 'collector', 'admin')
    }),
    // Invalid password
    fc.record({
      username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
      email: fc.emailAddress(),
      password: fc.oneof(
        fc.constant(''), // Empty password
        fc.string({ maxLength: 5 }), // Too short
        fc.string().filter(s => !/[A-Z]/.test(s)), // No uppercase
        fc.string().filter(s => !/[a-z]/.test(s)), // No lowercase
        fc.string().filter(s => !/\d/.test(s)) // No digit
      ),
      role: fc.constantFrom('resident', 'collector', 'admin')
    }),
    // Invalid role
    fc.record({
      username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
      email: fc.emailAddress(),
      password: fc.string({ minLength: 6 }).filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s)),
      role: fc.oneof(
        fc.constant('invalid-role'),
        fc.constant(''),
        fc.constant('user'), // Not in allowed values
        fc.constant('manager') // Not in allowed values
      )
    }),
    // Missing required fields
    fc.record({
      // Randomly omit required fields
      username: fc.option(fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s))),
      email: fc.option(fc.emailAddress()),
      password: fc.option(fc.string({ minLength: 6 }).filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s))),
      role: fc.constantFrom('resident', 'collector', 'admin')
    }).filter(data => !data.username || !data.email || !data.password) // Ensure at least one field is missing
  );

  test('should reject invalid registration data and provide validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(invalidRegistrationArbitrary, async (invalidData) => {
        // Make data unique to avoid conflicts
        const testData = {
          ...invalidData,
          username: invalidData.username ? `${invalidData.username}_${Date.now()}_${Math.random().toString(36).substring(7)}` : invalidData.username,
          email: invalidData.email ? `${Date.now()}_${Math.random().toString(36).substring(7)}_${invalidData.email}` : invalidData.email
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(testData);

        // Should reject invalid data
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
        expect(response.body.success).toBe(false);

        // Should provide error message
        expect(response.body.message).toBeDefined();
        expect(typeof response.body.message).toBe('string');

        // Should not create user
        if (testData.email && testData.email.includes('@')) {
          const userExists = await User.findOne({ email: testData.email });
          expect(userExists).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  // Generator for invalid login data
  const invalidLoginArbitrary = fc.oneof(
    // Missing email
    fc.record({
      password: fc.string({ minLength: 1 })
    }),
    // Missing password
    fc.record({
      email: fc.emailAddress()
    }),
    // Invalid email format
    fc.record({
      email: fc.oneof(
        fc.constant(''),
        fc.constant('invalid-email'),
        fc.constant('missing@'),
        fc.constant('@missing.com')
      ),
      password: fc.string({ minLength: 1 })
    }),
    // Empty password
    fc.record({
      email: fc.emailAddress(),
      password: fc.constant('')
    })
  );

  test('should reject invalid login data and provide validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(invalidLoginArbitrary, async (invalidLoginData) => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(invalidLoginData);

        // Should reject invalid data
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.success).toBe(false);

        // Should provide error message
        expect(response.body.message).toBeDefined();
        expect(typeof response.body.message).toBe('string');

        // Should not provide token
        expect(response.body.token).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  test('should handle malformed JSON and provide appropriate errors', async () => {
    const malformedJsonTests = [
      '{"username": "test"', // Incomplete JSON
      '{"username": "test",}', // Trailing comma
      '{username: "test"}', // Unquoted keys
      'not json at all',
      '',
      '{"username": }' // Missing value
    ];

    for (const malformedJson of malformedJsonTests) {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(malformedJson);

      expect(response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('should validate profile data when provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6 }).filter(s => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(s)),
          role: fc.constantFrom('resident', 'collector', 'admin'),
          profile: fc.record({
            firstName: fc.oneof(
              fc.string({ minLength: 51 }), // Too long
              fc.constant('') // Empty but not null
            ),
            lastName: fc.oneof(
              fc.string({ minLength: 51 }), // Too long
              fc.constant('') // Empty but not null
            ),
            phone: fc.oneof(
              fc.constant('invalid-phone'),
              fc.constant('123'), // Too short
              fc.constant('+'), // Just plus sign
              fc.constant('abcdefghijk') // Non-numeric
            ),
            address: fc.string({ minLength: 201 }) // Too long
          })
        }),
        async (invalidProfileData) => {
          // Make data unique
          const testData = {
            ...invalidProfileData,
            username: `${invalidProfileData.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${invalidProfileData.email}`
          };

          const response = await request(app)
            .post('/api/auth/register')
            .send(testData);

          // Should reject due to invalid profile data
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.body.success).toBe(false);

          // Should not create user
          const userExists = await User.findOne({ email: testData.email });
          expect(userExists).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle edge cases in validation', async () => {
    const edgeCases = [
      // Null values
      { username: null, email: 'test@test.com', password: 'Password123' },
      { username: 'test', email: null, password: 'Password123' },
      { username: 'test', email: 'test@test.com', password: null },
      
      // Undefined values (will be omitted in JSON)
      { email: 'test@test.com', password: 'Password123' }, // Missing username
      { username: 'test', password: 'Password123' }, // Missing email
      { username: 'test', email: 'test@test.com' }, // Missing password
      
      // Whitespace-only values
      { username: '   ', email: 'test@test.com', password: 'Password123' },
      { username: 'test', email: '   ', password: 'Password123' },
      { username: 'test', email: 'test@test.com', password: '   ' }
    ];

    for (const edgeCase of edgeCases) {
      const testData = {
        ...edgeCase,
        username: edgeCase.username ? `${edgeCase.username}_${Date.now()}_${Math.random().toString(36).substring(7)}` : edgeCase.username,
        email: edgeCase.email && edgeCase.email.includes('@') ? `${Date.now()}_${Math.random().toString(36).substring(7)}_${edgeCase.email}` : edgeCase.email
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(testData);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    }
  });
});