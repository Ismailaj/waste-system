# Role-Based API Documentation

## Overview

The Waste Management System implements role-based access control with three user roles:

- **👑 Admin**: Full system access and management capabilities
- **🚛 Collector**: Route and collection management
- **🏠 Resident**: Personal collection request management

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Role-Based Endpoints

### 🏠 Resident Endpoints

**What residents can do:**
- Create collection requests
- View their own requests
- Update their profile
- Cancel pending requests

```http
POST /api/collections                    # Create new collection request
GET /api/collections                     # View own requests only
GET /api/collections/:id                 # View own request details
DELETE /api/collections/:id              # Cancel own pending request
GET /api/dashboard                       # Resident dashboard
```

### 🚛 Collector Endpoints

**What collectors can do:**
- View assigned routes
- Update collection status
- View assigned collections
- Access collector dashboard

```http
GET /api/routes/collector/:id            # View own routes (collectors can only view their own)
PUT /api/routes/:id/status               # Update collection status in route
GET /api/collections                     # View assigned collections only
GET /api/dashboard                       # Collector dashboard
```

### 👑 Admin Endpoints

**What admins can do:**
- Everything residents and collectors can do, plus:
- Manage all users
- Assign collections to collectors
- View system reports
- Create and manage routes

```http
# User Management
GET /api/admin/users                     # List all users
PUT /api/admin/users/:id/role           # Update user role
DELETE /api/admin/users/:id             # Delete user (preserves historical data)

# Collection Management
GET /api/collections                     # View ALL collections
POST /api/admin/collections/assign      # Assign collection to collector
PUT /api/collections/:id/assign         # Assign specific collection

# Route Management
POST /api/routes                         # Create new route
GET /api/routes                          # View all routes
PUT /api/routes/:id/assign              # Assign collection to route
PUT /api/routes/:id/optimize            # Optimize route order

# Reports and Analytics
GET /api/admin/reports/statistics        # System statistics and performance metrics
GET /api/admin/dashboard                 # Admin dashboard with system overview
```

### 🔄 Shared Endpoints (All Authenticated Users)

```http
# Authentication
POST /api/auth/register                  # Register new user
POST /api/auth/login                     # Login
POST /api/auth/logout                    # Logout
GET /api/auth/profile                    # Get user profile
PUT /api/auth/profile                    # Update user profile

# Dashboard
GET /api/dashboard                       # Role-specific dashboard
GET /api/dashboard/quick-actions         # Role-specific quick actions
```

## Role-Based Data Filtering

The system automatically filters data based on user roles:

### Collection Requests (`GET /api/collections`)
- **Residents**: Only see their own requests
- **Collectors**: Only see requests assigned to them
- **Admins**: See all requests

### Routes (`GET /api/routes/collector/:id`)
- **Collectors**: Can only view their own routes
- **Admins**: Can view any collector's routes

### User Management
- **Only Admins**: Can view, create, update, and delete users

## Example Role-Based Responses

### Resident Dashboard Response
```json
{
  "success": true,
  "dashboard": {
    "user": { "username": "alice", "role": "resident" },
    "role": "resident",
    "residentData": {
      "myCollections": [...],
      "myStats": {
        "total": 5,
        "pending": 1,
        "inProgress": 1,
        "completed": 3
      },
      "capabilities": [
        "Create new collection requests",
        "View status of your requests",
        "Track collection progress"
      ]
    }
  }
}
```

### Collector Dashboard Response
```json
{
  "success": true,
  "dashboard": {
    "user": { "username": "john.collector", "role": "collector" },
    "role": "collector",
    "collectorData": {
      "todayRoute": {...},
      "assignedCollections": [...],
      "completedToday": 3,
      "capabilities": [
        "View assigned collection routes",
        "Update collection status",
        "Track daily completion progress"
      ]
    }
  }
}
```

### Admin Dashboard Response
```json
{
  "success": true,
  "dashboard": {
    "user": { "username": "admin", "role": "admin" },
    "role": "admin",
    "adminData": {
      "systemStats": {
        "totalUsers": 10,
        "totalCollections": 25,
        "pendingCollections": 5
      },
      "capabilities": [
        "Manage all users and roles",
        "Assign collections to collectors",
        "Generate system reports"
      ]
    }
  }
}
```

## Error Responses

### Insufficient Permissions
```json
{
  "success": false,
  "message": "Access denied. Required role: admin or collector. Your role: resident",
  "userRole": "resident",
  "requiredRoles": ["admin", "collector"]
}
```

### Authentication Required
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

## Test Credentials

Use these credentials to test different role capabilities:

### 👑 Admin Users
- `admin@wastemanagement.com` / `Admin123!`
- `manager@wastemanagement.com` / `Manager123!`

### 🚛 Collector Users  
- `john.collector@wastemanagement.com` / `Collector123!`
- `jane.collector@wastemanagement.com` / `Collector123!`
- `mike.collector@wastemanagement.com` / `Collector123!`

### 🏠 Resident Users
- `alice.resident@email.com` / `Resident123!`
- `bob.resident@email.com` / `Resident123!`
- `carol.resident@email.com` / `Resident123!`
- `david.resident@email.com` / `Resident123!`
- `emma.resident@email.com` / `Resident123!`