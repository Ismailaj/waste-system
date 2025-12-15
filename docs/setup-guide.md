# Setup Guide

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd waste-management-system
   npm run install:all
   ```

2. **Environment setup**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your MongoDB URI and JWT secret
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure Benefits

### ✅ **Clear Separation**
- `client/` - All React frontend code
- `server/` - All Express.js backend code
- `docs/` - Documentation

### ✅ **Independent Development**
- Each folder has its own `package.json`
- Frontend and backend can be developed independently
- Easy to deploy separately if needed

### ✅ **Simplified Scripts**
- Root `package.json` orchestrates both client and server
- Use `npm run dev` to start both servers
- Use `npm run server:test` for backend tests
- Use `npm run client:test` for frontend tests

## Development Workflow

### Starting Development
```bash
# Start both client and server
npm run dev

# Or start individually
npm run server:dev  # Backend on :5000
npm run client:dev  # Frontend on :3000
```

### Running Tests
```bash
# Backend tests
npm run server:test

# Property-based tests only
npm run server:test -- --testPathPattern="properties"

# Frontend tests
npm run client:test
```

### Building for Production
```bash
# Build React app
npm run client:build

# Start production server
npm start
```

## Folder Structure Details

```
waste-management-system/
├── client/                    # React Frontend
│   ├── public/
│   │   ├── assets/           # Images, icons
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # React context
│   │   ├── services/         # API calls
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js    # Tailwind CSS config
│   └── package.json          # Frontend dependencies
│
├── server/                    # Express.js Backend
│   ├── config/               # Database config
│   ├── middleware/           # Express middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── tests/                # Backend tests
│   │   └── properties/       # Property-based tests
│   ├── utils/                # Utility functions
│   ├── .env.example          # Environment template
│   ├── babel.config.js       # Babel config for tests
│   ├── jest.config.js        # Jest test config
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express server entry
│
├── docs/                      # Documentation
│   ├── design.md             # System design
│   ├── tasks.md              # Implementation tasks
│   └── setup-guide.md        # This file
│
├── package.json               # Root orchestration scripts
└── README.md                  # Project overview
```

## Benefits of This Structure

1. **Industry Standard**: Follows common MERN stack conventions
2. **Scalability**: Easy to add microservices or separate deployments
3. **Team Development**: Frontend and backend teams can work independently
4. **CI/CD Friendly**: Easy to set up separate build pipelines
5. **Clear Dependencies**: Each part has its own package.json
6. **Deployment Flexibility**: Can deploy client and server separately