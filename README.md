# Waste Management System

A comprehensive waste management system built with the MERN stack (MongoDB, Express.js, React, Node.js) that facilitates efficient coordination between residents, waste collectors, and administrators.

## Features

- **Role-based Access Control**: Separate interfaces for residents, collectors, and administrators
- **Collection Request Management**: Residents can submit waste collection requests
- **Route Optimization**: Collectors receive optimized pickup routes
- **Real-time Status Tracking**: Track collection requests from submission to completion
- **Administrative Dashboard**: Comprehensive management tools for administrators
- **Reporting System**: Generate statistics and performance metrics

## Technology Stack

- **Frontend**: React.js with modern hooks, React Router, Axios
- **Backend**: Node.js with Express.js, JWT authentication, bcrypt
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest, React Testing Library, fast-check for property-based testing

## Project Structure

```
├── client/                 # React frontend application
│   ├── public/            # Static assets and HTML template
│   ├── src/               # React source code
│   └── package.json       # Frontend dependencies
├── server/                 # Express.js backend application
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware functions
│   ├── models/            # Mongoose data models
│   ├── routes/            # Express route handlers
│   ├── tests/             # Backend test files
│   │   └── properties/    # Property-based tests
│   ├── utils/             # Utility functions
│   ├── server.js          # Express server entry point
│   └── package.json       # Backend dependencies
├── docs/                   # Project documentation
├── package.json            # Root package.json with scripts
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd waste-management-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   
   Or install separately:
   ```bash
   npm run server:install
   npm run client:install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example server/.env
   ```
   Edit `server/.env` with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/waste-management
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

4. **Start the development servers**
   
   Both servers concurrently:
   ```bash
   npm run dev
   ```
   
   Or start separately:
   ```bash
   npm run server:dev    # Backend server
   npm run client:dev    # Frontend server
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## User Roles

### Residents
- Submit waste collection requests
- Track request status
- View collection history
- Receive completion notifications

### Collectors
- View assigned collection routes
- Update collection status
- Access optimized pickup sequences
- Mark collections as completed

### Administrators
- Manage user accounts
- Assign collections to collectors
- Generate reports and statistics
- Oversee system operations

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Collections
- `GET /api/collections` - Get collections (role-filtered)
- `POST /api/collections` - Create collection request
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Cancel collection

### Routes
- `GET /api/routes/collector/:id` - Get collector routes
- `PUT /api/routes/:id/assign` - Assign collection to route

### Admin
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/reports/statistics` - Generate reports

## Testing

The project uses a dual testing approach:

### Backend Tests
```bash
npm run server:test
```

### Property-Based Tests
```bash
npm run server:test -- --testPathPattern="properties"
```

### Frontend Tests
```bash
npm run client:test
```

## Development Scripts

### Root Level Scripts
- `npm run dev` - Start both client and server in development mode
- `npm start` - Start production server
- `npm run install:all` - Install dependencies for both client and server

### Server Scripts
- `npm run server:start` - Start production server
- `npm run server:dev` - Start development server with nodemon
- `npm run server:test` - Run backend tests

### Client Scripts
- `npm run client:dev` - Start React development server
- `npm run client:build` - Build React app for production
- `npm run client:test` - Run frontend tests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

- [Design Document](docs/design.md) - System architecture and design decisions
- [Implementation Tasks](docs/tasks.md) - Development progress and task tracking

## License

This project is licensed under the ISC License.

## Author

Ismail Aj