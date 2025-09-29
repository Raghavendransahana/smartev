# SmartEV API Documentation

## Overview

The SmartEV API provides comprehensive REST endpoints for electric vehicle ecosystem management, including user authentication, vehicle management, battery tracking, charging session management, and blockchain integration.

**Base URL**: `http://localhost:4000/api`
**Version**: 1.0.0

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+91-9876543210"
  },
  "role": "owner"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "owner",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+91-9876543210"
      }
    },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

## Vehicle Management

### Register Vehicle
```http
POST /vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "make": "Tata",
  "model": "Nexon EV",
  "year": 2024,
  "vin": "VIN123456789",
  "batteryCapacity": 40.5,
  "registrationNumber": "MH12AB1234"
}
```

### Get User Vehicles
```http
GET /vehicles
Authorization: Bearer <token>
```

### Get Vehicle Details
```http
GET /vehicles/{vehicle_id}
Authorization: Bearer <token>
```

## Battery Management

### Log Battery Data
```http
POST /battery/log
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle_id",
  "stateOfCharge": 85,
  "temperature": 28.5,
  "voltage": 400.2,
  "current": 15.8,
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "mileage": 15280
}
```

### Get Battery History
```http
GET /battery/{vehicle_id}/history?limit=50&page=1
Authorization: Bearer <token>
```

### Get Battery Analytics
```http
GET /battery/{vehicle_id}/analytics
Authorization: Bearer <token>
```

## Charging Management

### Start Charging Session
```http
POST /charging/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle_id",
  "stationId": "station_id",
  "connectorType": "CCS2",
  "initialSoC": 45
}
```

### End Charging Session
```http
POST /charging/end
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session_id",
  "finalSoC": 90,
  "unitsConsumed": 18.5,
  "cost": 185.50
}
```

### Get Charging History
```http
GET /charging/sessions?limit=20&page=1
Authorization: Bearer <token>
```

### Get Nearby Charging Stations
```http
GET /charging/stations?lat=19.0760&lng=72.8777&radius=10
Authorization: Bearer <token>
```

## Blockchain Integration

### Get Transaction History
```http
GET /blockchain/transactions?limit=20&page=1
Authorization: Bearer <token>
```

### Verify Blockchain Data
```http
POST /blockchain/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionHash": "0x...",
  "dataType": "battery_passport"
}
```

### Get Battery Passport
```http
GET /blockchain/passport/{battery_id}
Authorization: Bearer <token>
```

## Analytics & Reports

### Get Vehicle Analytics
```http
GET /analytics/vehicle/{vehicle_id}?period=30d
Authorization: Bearer <token>
```

**Response includes**:
- Battery performance trends
- Charging patterns
- Energy efficiency metrics
- Maintenance predictions

### Get Usage Summary
```http
GET /analytics/summary
Authorization: Bearer <token>
```

## User Management

### Get User Profile
```http
GET /user/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+91-9876543210",
    "address": "123 Street, City, State"
  }
}
```

## Alerts & Notifications

### Get User Alerts
```http
GET /alerts?status=unread&limit=20
Authorization: Bearer <token>
```

### Mark Alert as Read
```http
PUT /alerts/{alert_id}/read
Authorization: Bearer <token>
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Battery Logging**: 60 requests per minute per user

## Postman Collection

Import the comprehensive Postman collection for testing:
```
File: backend/api/postman/FlexiEVChain-API.postman_collection.json
Environment: backend/api/postman/FlexiEVChain.postman_environment.json
```

The collection includes:
- Pre-configured requests for all endpoints
- Automated token management
- Test scripts for response validation
- Environment variables for easy configuration

### Using the Collection
1. Import both collection and environment files
2. Set your base URL in environment variables
3. Run authentication request first
4. Token will be automatically set for subsequent requests

## WebSocket Events

For real-time updates, connect to WebSocket endpoint:
```
ws://localhost:4000/ws
```

### Events
- `battery_update` - Real-time battery data
- `charging_status` - Charging session updates
- `alert_new` - New alert notifications
- `system_status` - System health updates