# Seed Data Documentation

## Overview

The seed data script populates the database with sample users, collection requests, and routes for development and testing purposes.

## Running the Seed Script

```bash
# From root directory
npm run seed

# Or from server directory
cd server && npm run seed
```

## Generated Data

### Users (10 total)

#### Administrators (2)
- **admin@wastemanagement.com** / `Admin123!`
  - Username: `admin`
  - Name: System Administrator
  - Phone: +15550001

- **manager@wastemanagement.com** / `Manager123!`
  - Username: `manager`
  - Name: Operations Manager
  - Phone: +15550002

#### Collectors (3)
- **john.collector@wastemanagement.com** / `Collector123!`
  - Username: `collector1`
  - Name: John Smith
  - Phone: +15551001

- **jane.collector@wastemanagement.com** / `Collector123!`
  - Username: `collector2`
  - Name: Jane Johnson
  - Phone: +15551002

- **mike.collector@wastemanagement.com** / `Collector123!`
  - Username: `collector3`
  - Name: Mike Wilson
  - Phone: +15551003

#### Residents (5)
- **alice.resident@email.com** / `Resident123!`
  - Username: `resident1`
  - Name: Alice Brown
  - Phone: +15552001

- **bob.resident@email.com** / `Resident123!`
  - Username: `resident2`
  - Name: Bob Davis
  - Phone: +15552002

- **carol.resident@email.com** / `Resident123!`
  - Username: `resident3`
  - Name: Carol Miller
  - Phone: +15552003

- **david.resident@email.com** / `Resident123!`
  - Username: `resident4`
  - Name: David Garcia
  - Phone: +15552004

- **emma.resident@email.com** / `Resident123!`
  - Username: `resident5`
  - Name: Emma Martinez
  - Phone: +15552005

### Collection Requests (~15)

Each resident has 2-5 collection requests with:
- **Waste Categories**: organic, recyclable, hazardous, general
- **Statuses**: pending, assigned, in-progress, completed
- **Locations**: Based on resident addresses with GPS coordinates
- **Created Dates**: Distributed over the past 30 days
- **Assigned Collectors**: Random assignment for non-pending requests

### Collection Routes (~10)

Routes are created for:
- **Date Range**: Today through next 7 days (excluding weekends)
- **Collectors**: Each collector gets routes with assigned collections
- **Status**: 
  - Today's routes: `active`
  - Future routes: `planned`
- **Optimized Order**: Sequential ordering of collections

## Testing Scenarios

### Login Testing
Use any of the provided credentials to test different user roles:

```bash
# Admin access
Email: admin@wastemanagement.com
Password: Admin123!

# Collector access
Email: john.collector@wastemanagement.com
Password: Collector123!

# Resident access
Email: alice.resident@email.com
Password: Resident123!
```

### API Testing
With seeded data, you can test:

1. **Authentication endpoints** with real user credentials
2. **Role-based access** with different user types
3. **Collection management** with existing requests
4. **Route optimization** with assigned collections
5. **Admin functions** with populated user base

### Database State
After seeding, the database contains:
- Realistic user profiles with proper role assignments
- Collection requests in various states
- Active and planned routes for collectors
- Proper relationships between users, requests, and routes

## Resetting Data

The seed script clears all existing data before creating new records:
- All users are deleted
- All collection requests are deleted  
- All collection routes are deleted

This ensures a clean, consistent state for testing.

## Customization

To modify the seed data:

1. Edit `server/scripts/seedData.js`
2. Adjust user counts, request patterns, or date ranges
3. Run `npm run seed` to apply changes

## Notes

- Phone numbers follow the format: `+1XXXXXXXXX` (no dashes)
- Passwords are hashed using bcrypt with salt rounds of 10
- GPS coordinates are centered around NYC area (40.7128, -74.0060)
- Collection routes only include today and future dates (no past dates)
- All timestamps use proper Date objects for consistency