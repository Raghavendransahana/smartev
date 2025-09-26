# FlexiEVChain API

Production-ready Express.js REST API for the FlexiEVChain platform with MongoDB Atlas integration.

## ✅ Production Status

- **Database**: MongoDB Atlas connected and verified
- **Collections**: All 9 production collections created with proper indexes
- **Authentication**: JWT-based auth with role-based access control
- **Validation**: Zod schema validation on all endpoints
- **Security**: Helmet, rate limiting, CORS protection
- **Logging**: Winston structured logging
- **Build**: TypeScript compilation successful

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account with connection string

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   Copy `.env.example` to `.env` and update with your MongoDB Atlas credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your Atlas connection string
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

## Database Collections

Successfully created and indexed:
- `users` - User accounts and profiles
- `vehicles` - Vehicle registrations and ownership
- `batterylogs` - Battery telemetry data
- `chargingsessions` - Charging history and patterns  
- `ownershiptransfers` - Vehicle ownership changes
- `blockchaintransactions` - Blockchain transaction records
- `alerts` - System notifications and warnings
- `auditlogs` - Security and compliance logging
- `oemdatas` - Manufacturer data and integrations

## API Endpoints

### System
- `GET /api/system/status` - Health check
- `GET /api/system/info` - System information

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update profile (authenticated)

## Authentication

All protected endpoints require a Bearer token:
```
Authorization: Bearer <jwt-token>
```

## User Roles

- `owner` - Vehicle owners (default)
- `oem` - Original equipment manufacturers
- `regulator` - Government regulators
- `service_provider` - Service providers
- `admin` - System administrators

## Testing

Test database connectivity:
```bash
npx ts-node src/scripts/test-db-connection.ts
```

Run all tests:
```bash
npm test
```

## Development Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - TypeScript compilation
- `npm run start` - Production server
- `npm run lint` - Code linting
- `npm test` - Run test suite

## Production Deployment

The API is production-ready with:
- MongoDB Atlas connectivity verified
- All collections and indexes created
- Environment validation enforcing Atlas URIs only
- Proper error handling and logging
- Security middleware configured
- TypeScript compilation successful

Ready for immediate deployment to cloud platforms like Heroku, AWS, or Azure.