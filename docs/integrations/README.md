# SmartEV Integration Guide

## Overview

This guide covers the integration of external services and APIs with the SmartEV platform, including charging network APIs, mapping services, AI/ML models, and blockchain integration.

## Charging Network Integration

### Open Charge Map (OCM) - Primary Integration

SmartEV uses Open Charge Map as the primary source for charging station data. OCM provides free, community-driven charging station information worldwide.

**Key Benefits:**
- ✅ **Free**: No API keys or usage limits
- ✅ **Global Coverage**: 500,000+ charging locations
- ✅ **Community Verified**: Real-world accuracy from EV drivers
- ✅ **Real-time Updates**: Community-maintained data

#### Implementation

**API Endpoint**: `https://api.openchargemap.io/v3/poi`

**Sample Request**:
```typescript
const fetchChargingStations = async (params: {
  countrycode?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  maxresults?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `https://api.openchargemap.io/v3/poi?${queryParams}`
  );
  return response.json();
};
```

**Data Processing**:
```typescript
interface OCMCharger {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    Country: { Title: string };
    Latitude: number;
    Longitude: number;
  };
  Connections: Array<{
    ConnectionTypeID: number;
    PowerKW: number;
    CurrentTypeID: number;
  }>;
  OperatorInfo: { Title: string };
  UsageType: { Title: string };
  StatusType: { Title: string };
}

const convertOCMToCharger = (ocm: OCMCharger): EVCharger => {
  const maxPower = Math.max(...ocm.Connections.map(c => c.PowerKW || 0));
  
  return {
    id: ocm.ID.toString(),
    name: ocm.AddressInfo.Title,
    lat: ocm.AddressInfo.Latitude,
    lng: ocm.AddressInfo.Longitude,
    type: classifyPowerType(maxPower),
    status: mapOCMStatus(ocm.StatusType?.Title),
    power: maxPower,
    connectorTypes: ocm.Connections.map(c => getConnectorType(c.ConnectionTypeID)),
    operator: ocm.OperatorInfo?.Title || 'Unknown',
    address: formatAddress(ocm.AddressInfo),
    usageType: ocm.UsageType?.Title || 'Unknown'
  };
};
```

### HERE Maps Integration (Optional)

HERE Maps can be used for enhanced mapping features and route planning.

**Setup**:
1. Get API key from [HERE Developer Portal](https://developer.here.com/)
2. Configure environment variables:
   ```env
   VITE_HERE_API_KEY=your_here_api_key
   ```

**Usage**:
```typescript
const HEREMapComponent: React.FC<{
  apiKey: string;
  onChargerSelect?: (charger: EVCharger) => void;
}> = ({ apiKey, onChargerSelect }) => {
  // HERE Maps implementation
};
```

## Mapping Services

### OpenStreetMap with Leaflet (Primary)

SmartEV uses Leaflet.js with OpenStreetMap for free, open-source mapping.

**Installation**:
```bash
npm install leaflet @types/leaflet
```

**Implementation**:
```typescript
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent: React.FC<{
  center: [number, number];
  zoom: number;
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    popup: string;
  }>;
}> = ({ center, zoom, markers }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map.current) {
      // Initialize map
      map.current = L.map(mapRef.current).setView(center, zoom);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);
      
      // Add markers
      markers.forEach(marker => {
        L.marker([marker.lat, marker.lng])
          .addTo(map.current!)
          .bindPopup(marker.popup);
      });
    }
  }, [center, zoom, markers]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};
```

## AI/ML Integration

### Battery Analytics Engine

The ML engine provides predictive analytics for battery health and performance.

**Setup**:
```bash
cd "model & ai/ml"
python -m venv mobility
source mobility/bin/activate  # Windows: mobility\Scripts\activate
pip install -r requirements.txt
```

**API Server**:
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib

app = Flask(__name__)
CORS(app)

# Load trained models
battery_model = joblib.load('models/battery_health_model.pkl')
usage_model = joblib.load('models/usage_prediction_model.pkl')

@app.route('/predict/battery-health', methods=['POST'])
def predict_battery_health():
    data = request.json
    
    # Extract features
    features = np.array([[
        data['voltage'],
        data['current'],
        data['temperature'],
        data['cycle_count'],
        data['age_months']
    ]])
    
    # Make prediction
    health_score = battery_model.predict(features)[0]
    
    return jsonify({
        'health_score': float(health_score),
        'status': 'healthy' if health_score > 80 else 'degraded',
        'recommendations': generate_recommendations(health_score)
    })

@app.route('/predict/usage-pattern', methods=['POST'])
def predict_usage_pattern():
    data = request.json
    usage_prediction = usage_model.predict([data['historical_data']])[0]
    
    return jsonify({
        'predicted_usage': usage_prediction.tolist(),
        'confidence': 0.85,
        'insights': analyze_usage_pattern(usage_prediction)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

**Frontend Integration**:
```typescript
const MLService = {
  async predictBatteryHealth(data: {
    voltage: number;
    current: number;
    temperature: number;
    cycle_count: number;
    age_months: number;
  }) {
    const response = await fetch('http://localhost:5000/predict/battery-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async predictUsagePattern(historicalData: number[]) {
    const response = await fetch('http://localhost:5000/predict/usage-pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historical_data: historicalData })
    });
    return response.json();
  }
};
```

### Chat AI Integration

SmartEV includes an AI-powered chat assistant using Groq API.

**Setup**:
```bash
cd chat
npm install
```

**Environment Configuration**:
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-8b-8192
```

**Implementation**:
```javascript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const chatService = {
  async generateResponse(userMessage, context = {}) {
    const systemPrompt = `
    You are an expert EV assistant for the Indian market. Provide helpful, 
    accurate information about electric vehicles, charging, battery care, 
    and government policies in India.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1024
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }
};
```

## Blockchain Integration

### Smart Contract Deployment

**Setup Hardhat**:
```bash
cd backend/blockchain
npm install
npx hardhat compile
```

**Deploy Contracts**:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Smart Contract Integration**:
```typescript
import { ethers } from 'ethers';
import BatteryLifecycleTracker from '../artifacts/contracts/evarchitecture.sol/BatteryLifecycleTracker.json';

export class BlockchainService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor(providerUrl: string, contractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.contract = new ethers.Contract(
      contractAddress,
      BatteryLifecycleTracker.abi,
      this.provider
    );
  }

  async createBatteryPassport(
    serialNumber: string,
    vehicleHash: string,
    manufacturer: string
  ) {
    const signer = await this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.registerPassport(
      serialNumber,
      vehicleHash,
      manufacturer
    );
    
    return await tx.wait();
  }

  async getBatteryPassport(passportId: string) {
    return await this.contract.getPassportDetails(passportId);
  }

  async updateBatteryData(passportId: string, healthScore: number) {
    const signer = await this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.logHealthScore(
      passportId,
      healthScore,
      Math.floor(Date.now() / 1000)
    );
    
    return await tx.wait();
  }
}
```

## Database Integration

### MongoDB Setup

**Connection Configuration**:
```typescript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      // Connection options
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
```

**Schema Examples**:
```typescript
// Vehicle Schema
const vehicleSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  vin: { type: String, required: true, unique: true },
  batteryCapacity: { type: Number, required: true },
  registrationNumber: { type: String, required: true },
  batteryPassportId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Battery Data Schema
const batteryDataSchema = new Schema({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  stateOfCharge: { type: Number, required: true, min: 0, max: 100 },
  temperature: { type: Number, required: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now }
});
```

## Security Configuration

### API Security

**Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const createRateLimit = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: { error: 'Too many requests, please try again later.' }
  });

// Apply different limits to different routes
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5)); // 5 requests per 15 min
app.use('/api', createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 min
```

**CORS Configuration**:
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Testing Integration

### API Testing with Jest
```typescript
import request from 'supertest';
import app from '../src/app';

describe('Authentication Endpoints', () => {
  test('POST /api/auth/register', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testpassword123',
      profile: { firstName: 'Test', lastName: 'User' },
      role: 'owner'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

### Frontend Integration Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChargingStationsMap } from '../components/ChargingStationsMap';

test('displays charging stations on map', async () => {
  render(<ChargingStationsMap />);
  
  await waitFor(() => {
    expect(screen.getByText('Loading stations...')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.queryByText('Loading stations...')).not.toBeInTheDocument();
  });
});
```

## Deployment Integration

### Docker Configuration
```dockerfile
# Backend API
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]

# ML Engine
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "battery_api_server.py"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: ./backend/api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/smartev
    depends_on:
      - mongo

  ml-engine:
    build: ./model & ai/ml
    ports:
      - "5000:5000"
    volumes:
      - ./model & ai/ml/models:/app/models

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Monitoring & Logging

### Application Monitoring
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// API request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});
```

This comprehensive integration guide covers all major external services and APIs used in the SmartEV platform, providing developers with the necessary information to set up, configure, and extend the system.