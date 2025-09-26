# FlexiEVChain API Postman Collection

This directory contains Postman collection and environment files for testing the FlexiEVChain API endpoints.

## Files

- `FlexiEVChain-API.postman_collection.json` - Complete API collection with all endpoints
- `FlexiEVChain.postman_environment.json` - Environment variables for testing

## Quick Setup

1. **Import Collection**:
   - Open Postman
   - Click "Import" → "Upload Files"
   - Select `FlexiEVChain-API.postman_collection.json`

2. **Import Environment**:
   - Click "Import" → "Upload Files" 
   - Select `FlexiEVChain.postman_environment.json`
   - Set as active environment in top-right dropdown

3. **Start API Server**:
   ```bash
   npm run dev
   ```

4. **Test the API**:
   - Run "System" → "Health Check" first
   - Execute "Authentication" → "User Registration" 
   - Token will auto-populate for authenticated requests

## API Endpoints Included

### System
- ✅ Health Check (`GET /api/system/status`)
- ✅ System Info (`GET /api/system/info`)

### Authentication
- ✅ User Registration (`POST /api/users/register`)
- ✅ User Login (`POST /api/users/login`)
- 🔒 Auto-saves JWT token for subsequent requests

### User Management
- 🔒 Get User Profile (`GET /api/users/profile`)
- 🔒 Update User Profile (`PUT /api/users/profile`)

### Vehicle Management
- 🔒 Register Vehicle (`POST /api/vehicles`)
- 🔒 Get User Vehicles (`GET /api/vehicles`)
- 🔒 Get Vehicle Details (`GET /api/vehicles/:vehicleId`)

### Battery Management
- 🔒 Log Battery Data (`POST /api/battery/log`)
- 🔒 Get Battery History (`GET /api/battery/:vehicleId/history`)

### Charging Management
- 🔒 Start Charging Session (`POST /api/charging/start`)
- 🔒 End Charging Session (`POST /api/charging/end`)
- 🔒 Get Charging History (`GET /api/charging/:vehicleId/history`)

### Ownership Management
- 🔒 Transfer Vehicle Ownership (`POST /api/ownership/transfer`)
- 🔒 Get Ownership History (`GET /api/ownership/:vehicleId/history`)

### Alerts & Notifications
- 🔒 Get User Alerts (`GET /api/alerts`)
- 🔒 Mark Alert as Read (`PUT /api/alerts/:alertId`)

### Analytics & Reports
- 🔒 Get Vehicle Analytics (`GET /api/analytics/:vehicleId`)
- 🔒 Get Usage Summary (`GET /api/analytics/summary`)

### Blockchain Integration
- 🔒 Get Transaction History (`GET /api/blockchain/transactions`)
- 🔒 Verify Transaction (`GET /api/blockchain/verify/:txId`)

## Test Data

The collection includes realistic test data:

### Sample User Registration
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "owner",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0123"
  }
}
```

### Sample Vehicle Registration
```json
{
  "brand": "Tesla",
  "vehicleModel": "Model 3",
  "vin": "1HGBH41JXMN109186",
  "status": "active"
}
```

### Sample Battery Data
```json
{
  "batteryLevel": 85.5,
  "voltage": 400.2,
  "temperature": 32.1,
  "cycleCount": 245,
  "healthPercentage": 92.3,
  "chargingStatus": "not_charging"
}
```

## Features

- ✅ **Auto-Authentication**: JWT token automatically saved and used
- ✅ **Pre/Post Scripts**: Request validation and response testing
- ✅ **Environment Variables**: Easy switching between dev/staging/prod
- ✅ **Response Testing**: Automatic validation of API responses
- ✅ **Realistic Data**: Production-ready test data
- ✅ **Complete Coverage**: All API endpoints included

## Usage Tips

1. **Start with System endpoints** to verify API is running
2. **Register/Login first** to get authentication token
3. **Create a vehicle** before testing battery/charging endpoints
4. **Check Console** for detailed request/response logging
5. **Update IDs** in environment variables as you create resources

## Authentication

🔒 = Requires authentication (Bearer token)
✅ = Public endpoint

The collection automatically handles JWT token management - just run the registration or login request and subsequent requests will be authenticated.

## Troubleshooting

- Ensure API server is running on `http://localhost:4000`
- Check that MongoDB Atlas connection is working
- Verify environment variables are set correctly
- Review Postman console for detailed error messages