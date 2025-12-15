# Design Document

## Overview

The Waste Management System is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) that facilitates efficient coordination between residents, waste collectors, and administrators. The system provides role-based access control, real-time status tracking, and optimized collection route management.

The application follows a three-tier architecture with a React frontend, Express.js REST API backend, and MongoDB database. The system emphasizes data consistency, user experience, and operational efficiency for waste management operations.

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express.js API │    │   MongoDB       │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ - User Interface│    │ - REST Endpoints│    │ - User Data     │
│ - State Mgmt    │    │ - Authentication│    │ - Collections   │
│ - API Calls     │    │ - Business Logic│    │ - Routes        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React.js with modern hooks, React Router for navigation, Axios for API communication
- **Backend**: Node.js with Express.js framework, JWT for authentication, bcrypt for password hashing
- **Database**: MongoDB with Mongoose ODM for schema modeling and validation
- **Additional**: CORS for cross-origin requests, dotenv for environment configuration

## Components and Interfaces

### Frontend Components

#### Authentication Components
- **LoginForm**: Handles user login with credential validation
- **SignupForm**: Manages new user registration with role selection
- **ProtectedRoute**: Wrapper component for route-based access control

#### User Interface Components
- **Dashboard**: Role-specific landing page displaying relevant information
- **CollectionRequestForm**: Form for residents to submit waste collection requests
- **CollectionList**: Displays collection requests with filtering and sorting
- **RouteView**: Shows assigned collection routes for waste collectors
- **AdminPanel**: Administrative interface for user and system management

#### Shared Components
- **Header**: Navigation bar with user authentication status
- **StatusBadge**: Visual indicator for collection request status
- **LoadingSpinner**: Loading state indicator for async operations

### Backend API Endpoints

#### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/profile` - User profile retrieval

#### Collection Management Routes
- `POST /api/collections` - Create new collection request
- `GET /api/collections` - Retrieve collection requests (filtered by user role)
- `PUT /api/collections/:id` - Update collection status
- `DELETE /api/collections/:id` - Cancel collection request

#### Route Management Routes
- `GET /api/routes/collector/:id` - Get assigned routes for collector
- `PUT /api/routes/:id/assign` - Assign collection to route (admin only)

#### User Management Routes (Admin)
- `GET /api/users` - List all users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user account

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['resident', 'collector', 'admin']),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Collection Request Schema
```javascript
{
  _id: ObjectId,
  requesterId: ObjectId (ref: 'User'),
  wasteCategory: String (enum: ['organic', 'recyclable', 'hazardous', 'general']),
  pickupLocation: {
    address: String (required),
    coordinates: {
      lat: Number,
      lng: Number
    },
    instructions: String
  },
  status: String (enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled']),
  assignedCollector: ObjectId (ref: 'User'),
  scheduledDate: Date,
  completedDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection Route Schema
```javascript
{
  _id: ObjectId,
  collectorId: ObjectId (ref: 'User'),
  date: Date,
  collections: [ObjectId] (ref: 'CollectionRequest'),
  optimizedOrder: [Number], // indices for optimal pickup sequence
  status: String (enum: ['planned', 'active', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 1.1 and 4.1 both test user account creation - these can be combined into a comprehensive user creation property
- Properties 2.1 and 2.4 both test collection request creation - these can be combined into a single collection creation property  
- Properties 3.2 and 5.2 both test timestamp updates - these can be combined into a single timestamp property
- Properties 5.1 and 4.2 both test request querying - these can be combined into a role-based query property
- Properties 6.1 and 6.4 both test data persistence and consistency - these can be combined into a data integrity property

### Core Properties

**Property 1: User account creation with role assignment**
*For any* valid user registration data and role specification, creating a user account should result in a stored user with encrypted password and correct role assignment
**Validates: Requirements 1.1, 4.1**

**Property 2: Authentication round trip**
*For any* registered user, providing their correct credentials should grant system access, while incorrect credentials should be rejected
**Validates: Requirements 1.2, 1.3**

**Property 3: Session management consistency**
*For any* authenticated user, logging out should terminate their session and prevent further authenticated actions
**Validates: Requirements 1.4**

**Property 4: Input validation rejection**
*For any* invalid or incomplete form data (registration, collection requests), the system should reject the submission and display appropriate validation errors
**Validates: Requirements 1.5, 2.5**

**Property 5: Collection request creation with unique identifiers**
*For any* valid collection request data, creating a request should result in a stored Collection_Request with pending status and unique identifier
**Validates: Requirements 2.1, 2.4**

**Property 6: Waste category validation**
*For any* waste category selection, only valid categories should be accepted while invalid categories are rejected
**Validates: Requirements 2.2**

**Property 7: Location data persistence**
*For any* pickup location details, the location information should be accurately stored and retrievable with the Collection_Request
**Validates: Requirements 2.3**

**Property 8: Collector route display**
*For any* waste collector, logging in should display their assigned Collection_Route with requests ordered by optimal pickup sequence
**Validates: Requirements 3.1, 3.4**

**Property 9: Status updates with timestamps**
*For any* collection status change, the system should record the new status with an immediate timestamp update
**Validates: Requirements 3.2, 5.2**

**Property 10: Collection completion updates**
*For any* collection marked as completed by an assigned collector, the Collection_Request status should be updated to completed
**Validates: Requirements 3.3**

**Property 11: Authorization enforcement**
*For any* attempt to update a collection by a non-assigned collector, the system should prevent the update and display an authorization error
**Validates: Requirements 3.5**

**Property 12: Role-based data access**
*For any* user querying collection requests, the system should return only the requests appropriate for their role (own requests for residents, assigned requests for collectors, all requests for admins)
**Validates: Requirements 4.2, 5.1**

**Property 13: Collection assignment updates routes**
*For any* valid assignment of a collection request to a collector by an administrator, the collector's Collection_Route should be updated to include the assigned request
**Validates: Requirements 4.3**

**Property 14: Report generation accuracy**
*For any* collection data in the system, generated reports should accurately compile statistics and performance metrics
**Validates: Requirements 4.4**

**Property 15: User deletion preserves historical data**
*For any* user account deletion by an administrator, the user should be removed while all historical collection data remains intact
**Validates: Requirements 4.5**

**Property 16: Request detail history display**
*For any* collection request, viewing its details should display complete collection history and status progression
**Validates: Requirements 5.3**

**Property 17: Completion notifications**
*For any* collection marked as completed, the requesting resident should receive a completion notification
**Validates: Requirements 5.4**

**Property 18: Date range search accuracy**
*For any* date range search query, the system should return only Collection_Request records that fall within the specified date range
**Validates: Requirements 5.5**

**Property 19: Data persistence and consistency**
*For any* collection data operation, the information should be immediately stored in MongoDB and maintain consistency across all related operations
**Validates: Requirements 6.1, 6.4**

**Property 20: Graceful error handling**
*For any* database operation failure, the system should handle the error gracefully and notify users appropriately
**Validates: Requirements 6.2**

**Property 21: Session expiration data preservation**
*For any* user session expiration, unsaved form data should be preserved where technically possible
**Validates: Requirements 6.3**

**Property 22: Data integrity validation**
*For any* data retrieved from storage, the system should validate data integrity before displaying to users
**Validates: Requirements 6.5**

## Error Handling

### Client-Side Error Handling
- **Network Errors**: Display user-friendly messages for connection issues
- **Validation Errors**: Show inline validation messages for form fields
- **Authentication Errors**: Redirect to login page with appropriate error messages
- **Authorization Errors**: Display access denied messages with role-specific guidance

### Server-Side Error Handling
- **Database Connection Errors**: Implement connection pooling and retry logic
- **Validation Errors**: Return structured error responses with field-specific messages
- **Authentication Failures**: Return appropriate HTTP status codes with security considerations
- **Route Not Found**: Return 404 errors with helpful navigation suggestions

### Error Logging and Monitoring
- **Server Errors**: Log all server errors with timestamps and request context
- **User Actions**: Track failed user actions for system improvement
- **Performance Issues**: Monitor response times and database query performance

## Testing Strategy

### Dual Testing Approach

The system will implement both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing

Unit tests will cover:
- Specific examples that demonstrate correct behavior
- Integration points between React components and API endpoints
- Database model validation and relationships
- Authentication middleware functionality
- Error handling scenarios with specific inputs

**Framework**: Jest for backend testing, React Testing Library for frontend components

### Property-Based Testing

Property-based testing will validate the correctness properties defined above using:

**Framework**: fast-check for JavaScript property-based testing

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough validation

**Test Tagging**: Each property-based test will be tagged with a comment explicitly referencing the correctness property from this design document using the format: '**Feature: waste-management-system, Property {number}: {property_text}**'

**Implementation Requirements**:
- Each correctness property will be implemented by a single property-based test
- Tests will generate random valid inputs to verify properties hold across all scenarios
- Property tests will focus on core business logic and data consistency
- Tests will avoid mocking where possible to validate real system behavior

### Integration Testing

- **API Endpoint Testing**: Verify complete request-response cycles
- **Database Integration**: Test data persistence and retrieval operations
- **Authentication Flow**: Validate complete login/logout cycles
- **Role-Based Access**: Verify permission enforcement across user roles