/**
 * Feature: waste-management-system, Property 1: User account creation with role assignment
 * 
 * Property: For any valid user registration data and role specification, 
 * creating a user account should result in a stored user with encrypted password 
 * and correct role assignment
 * 
 * Validates: Requirements 1.1, 4.1
 */

import fc from 'fast-check';
import User from '../../models/User.js';
import bcrypt from 'bcrypt';

describe('Property 1: User account creation with role assignment', () => {
  // Generator for valid user data
  const validUserArbitrary = fc.record({
    username: fc.string({ minLength: 3, maxLength: 30 })
      .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)), // Valid username characters
    email: fc.emailAddress(),
    password: fc.string({ minLength: 6, maxLength: 50 }),
    role: fc.constantFrom('resident', 'collector', 'admin'),
    profile: fc.record({
      firstName: fc.option(fc.string({ maxLength: 50 })),
      lastName: fc.option(fc.string({ maxLength: 50 })),
      phone: fc.option(fc.string().filter(s => /^[\+]?[1-9][\d]{0,15}$/.test(s))),
      address: fc.option(fc.string({ maxLength: 200 }))
    })
  });

  test('should create user with encrypted password and correct role for any valid input', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArbitrary, async (userData) => {
        // Create user with the generated data
        const user = new User(userData);
        const savedUser = await user.save();

        // Verify user was created
        expect(savedUser).toBeDefined();
        expect(savedUser._id).toBeDefined();
        
        // Verify username and email are stored correctly
        expect(savedUser.username).toBe(userData.username);
        expect(savedUser.email).toBe(userData.email.toLowerCase());
        
        // Verify role is assigned correctly
        expect(savedUser.role).toBe(userData.role);
        
        // Verify password is encrypted (not plain text)
        expect(savedUser.password).not.toBe(userData.password);
        expect(savedUser.password).toMatch(/^\$2[aby]\$\d{1,2}\$.{53}$/); // bcrypt hash pattern
        
        // Verify password can be validated
        const isPasswordValid = await bcrypt.compare(userData.password, savedUser.password);
        expect(isPasswordValid).toBe(true);
        
        // Verify profile data is stored correctly
        if (userData.profile.firstName) {
          expect(savedUser.profile.firstName).toBe(userData.profile.firstName);
        }
        if (userData.profile.lastName) {
          expect(savedUser.profile.lastName).toBe(userData.profile.lastName);
        }
        if (userData.profile.phone) {
          expect(savedUser.profile.phone).toBe(userData.profile.phone);
        }
        if (userData.profile.address) {
          expect(savedUser.profile.address).toBe(userData.profile.address);
        }
        
        // Verify timestamps are set
        expect(savedUser.createdAt).toBeDefined();
        expect(savedUser.updatedAt).toBeDefined();
        
        // Clean up - remove the created user
        await User.findByIdAndDelete(savedUser._id);
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });

  test('should handle role assignment correctly for admin-created users', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserArbitrary,
        fc.constantFrom('resident', 'collector', 'admin'),
        async (userData, assignedRole) => {
          // Simulate admin creating user with specific role
          const userDataWithRole = { ...userData, role: assignedRole };
          
          const user = new User(userDataWithRole);
          const savedUser = await user.save();

          // Verify the assigned role is correctly stored
          expect(savedUser.role).toBe(assignedRole);
          
          // Verify other properties are still correct
          expect(savedUser.username).toBe(userData.username);
          expect(savedUser.email).toBe(userData.email.toLowerCase());
          
          // Verify password encryption
          const isPasswordValid = await bcrypt.compare(userData.password, savedUser.password);
          expect(isPasswordValid).toBe(true);
          
          // Clean up
          await User.findByIdAndDelete(savedUser._id);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain data integrity across multiple user creations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validUserArbitrary, { minLength: 2, maxLength: 10 }),
        async (usersData) => {
          const createdUsers = [];
          
          try {
            // Create multiple users
            for (const userData of usersData) {
              // Ensure unique usernames and emails for this test
              const uniqueUserData = {
                ...userData,
                username: `${userData.username}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                email: `${Date.now()}_${Math.random().toString(36).substring(7)}_${userData.email}`
              };
              
              const user = new User(uniqueUserData);
              const savedUser = await user.save();
              createdUsers.push(savedUser);
              
              // Verify each user has correct properties
              expect(savedUser.role).toBe(userData.role);
              expect(savedUser.password).not.toBe(userData.password);
              
              // Verify password encryption works
              const isPasswordValid = await bcrypt.compare(userData.password, savedUser.password);
              expect(isPasswordValid).toBe(true);
            }
            
            // Verify all users were created with unique IDs
            const userIds = createdUsers.map(user => user._id.toString());
            const uniqueIds = new Set(userIds);
            expect(uniqueIds.size).toBe(createdUsers.length);
            
          } finally {
            // Clean up all created users
            for (const user of createdUsers) {
              await User.findByIdAndDelete(user._id);
            }
          }
        }
      ),
      { numRuns: 50 } // Fewer runs for this more complex test
    );
  });
});