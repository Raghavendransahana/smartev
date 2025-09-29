# SmartEV - Comprehensive EV Ecosystem Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-purple.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://python.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8+-orange.svg)](https://soliditylang.org/)

## 🚗 Overview

SmartEV is a comprehensive electric vehicle ecosystem platform that combines blockchain technology, AI/ML analytics, IoT telemetry, and multi-platform applications to provide end-to-end EV management solutions. The platform serves manufacturers, dealers, fleet operators, and individual EV owners with a complete suite of tools for battery lifecycle tracking, charging station management, predictive analytics, and smart contract-based transactions.

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend Web  │    │  Mobile App     │    │   Admin Panel   │
│   (React/Vite)  │    │ (React Native)  │    │  (React/Vite)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                    API Gateway & Load Balancer                   │
└─────────────────────────────────┼─────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   Backend API   │    │  Chat Service   │    │  ML/AI Engine   │
│ (Node.js/TS)    │    │   (Node.js)     │    │   (Python)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   MongoDB       │    │  Vector Store   │    │  Battery Twin   │
│   Database      │    │   (RAG Data)    │    │  (Telemetry)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │
┌─────────▼───────┐
│   Blockchain    │
│ (Hardhat/ETH)   │
└─────────────────┘
```

## 🌟 Key Features

### 🔋 Battery Lifecycle Management
- **Digital Battery Passports**: Blockchain-based immutable battery records
- **Real-time Health Monitoring**: AI-powered battery degradation analysis
- **Predictive Maintenance**: ML models for optimal battery performance
- **Recycling Tracking**: Complete end-of-life battery management

### 📱 Multi-Platform Applications
- **Web Dashboard**: React-based admin and user interfaces
- **Mobile App**: Cross-platform React Native application
- **Progressive Web App**: Responsive web application for mobile devices
- **Admin Panel**: Comprehensive management interface

### 🤖 AI-Powered Analytics
- **Battery Twin Technology**: Digital twins for real-time battery simulation
- **Predictive Analytics**: Usage pattern analysis and optimization
- **Smart Recommendations**: AI-driven charging and maintenance suggestions
- **Anomaly Detection**: ML-based fault detection and alerting

### 🗺️ Charging Network Integration
- **Open Charge Map**: Real-time charging station data from global community
- **Route Planning**: Smart charging route optimization
- **Station Management**: Admin tools for charging infrastructure
- **Real-time Availability**: Live charging station status updates

### 💬 Intelligent Chat Assistant
- **RAG-based AI**: Context-aware EV assistance and support
- **Multi-language Support**: Support for Indian regional languages
- **Voice Integration**: Speech-to-text and text-to-speech capabilities
- **Knowledge Base**: Comprehensive EV information and troubleshooting

### 🔗 Blockchain Integration
- **Smart Contracts**: Automated transactions and agreements
- **Ownership Tracking**: Immutable ownership and transfer records
- **Supply Chain Transparency**: Complete EV component traceability
- **Decentralized Identity**: Secure user and device identity management

## 🛠️ Technology Stack

### Backend
- **Framework**: Node.js with Express.js and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful APIs with comprehensive validation
- **Blockchain**: Hardhat framework with Ethereum-compatible smart contracts
- **ML Integration**: Python Flask APIs for model serving

### Frontend
- **Web**: React 18 with TypeScript and Vite build system
- **Mobile**: React Native with Expo for cross-platform development
- **UI Framework**: Tailwind CSS with Radix UI components
- **State Management**: React Context API and custom hooks
- **Maps Integration**: Leaflet.js with OpenStreetMap tiles

### AI/ML Stack
- **Framework**: Python with scikit-learn, PyTorch
- **Dashboard**: Dash and Plotly for interactive visualizations
- **Data Processing**: Pandas and NumPy for data manipulation
- **Model Serving**: Flask with CORS for API endpoints
- **Battery Modeling**: Custom ML models for battery performance prediction

### Infrastructure
- **Containerization**: Docker for microservices deployment
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Winston logging with structured logging
- **Security**: Helmet.js, CORS, rate limiting, and input validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smartev.git
cd smartev
```

2. **Backend API Setup**
```bash
cd backend/api
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. **Frontend Web Setup**
```bash
cd frontend/web
npm install
npm run dev
```

4. **Mobile App Setup**
```bash
cd frontend/app
npm install
npm run start
```

5. **ML/AI Engine Setup**
```bash
cd "model & ai/ml"
python -m venv mobility
source mobility/bin/activate  # On Windows: mobility\Scripts\activate
pip install -r requirements.txt
python battery_api_server.py
```

6. **Blockchain Setup**
```bash
cd backend/blockchain
npm install
npx hardhat compile
npx hardhat deploy --network localhost
```

7. **Chat Service Setup**
```bash
cd chat
npm install
cp .env.example .env
# Configure your AI API keys (Groq/OpenAI)
npm start
```

### Environment Configuration

Create `.env` files in respective directories:

**Backend API** (`backend/api/.env`):
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/smartev
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Blockchain
BLOCKCHAIN_NETWORK_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here

# External APIs
OCM_API_URL=https://api.openchargemap.io/v3
```

**Frontend Web** (`frontend/web/.env.local`):
```env
VITE_API_URL=http://localhost:4000/api
VITE_OCM_API_URL=https://api.openchargemap.io/v3
```

**Chat Service** (`chat/.env`):
```env
GROQ_API_KEY=your_groq_api_key
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## 📊 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Vehicle Management
- `GET /api/vehicles` - List user vehicles
- `POST /api/vehicles` - Register new vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle information

#### Battery Management
- `POST /api/battery/log` - Log battery data
- `GET /api/battery/:vehicleId/history` - Get battery history
- `GET /api/battery/:vehicleId/analytics` - Get battery analytics
- `POST /api/battery/passport` - Create battery passport

#### Charging Management
- `POST /api/charging/start` - Start charging session
- `POST /api/charging/end` - End charging session
- `GET /api/charging/sessions` - Get charging history
- `GET /api/charging/stations` - Get nearby charging stations

#### Blockchain Integration
- `GET /api/blockchain/transactions` - Get blockchain transactions
- `POST /api/blockchain/verify` - Verify blockchain data
- `GET /api/blockchain/passport/:id` - Get battery passport from blockchain

### API Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## 🔧 Development

### Project Structure
```
smartev/
├── backend/
│   ├── api/                    # REST API server
│   │   ├── src/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── models/         # MongoDB models
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   ├── middlewares/    # Custom middleware
│   │   │   └── utils/          # Utility functions
│   │   └── tests/              # API tests
│   └── blockchain/             # Smart contracts
│       ├── contracts/          # Solidity contracts
│       ├── scripts/            # Deployment scripts
│       └── deployments/        # Contract addresses
├── frontend/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API integration
│   │   │   └── utils/          # Frontend utilities
│   │   └── public/             # Static assets
│   └── app/                    # React Native mobile app
│       ├── src/
│       │   ├── components/     # Mobile components
│       │   ├── screens/        # Screen components
│       │   ├── navigation/     # Navigation setup
│       │   └── services/       # Mobile API services
│       └── assets/             # Mobile assets
├── chat/                       # AI chat service
│   ├── src/
│   │   ├── routes/             # Chat routes
│   │   └── services/           # AI integration
│   └── uploads/                # File uploads
├── model & ai/                 # ML/AI engine
│   ├── ml/
│   │   ├── models/             # Trained ML models
│   │   ├── notebooks/          # Jupyter notebooks
│   │   └── data/               # Training data
│   └── chatbot/                # AI chatbot models
├── telementry/                 # IoT telemetry service
│   └── src/                    # Telemetry processing
└── docs/                       # Documentation
    ├── api/                    # API documentation
    └── integrations/           # Integration guides
```

### Running Tests
```bash
# Backend API tests
cd backend/api
npm test

# Frontend tests
cd frontend/web
npm test

# Integration tests
cd telementry
npm test
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Format code
npm run format
```

## 🚀 Deployment

### Production Environment Setup

1. **Environment Variables**: Configure production environment variables
2. **Database**: Set up MongoDB Atlas or production MongoDB instance
3. **Blockchain**: Deploy smart contracts to mainnet or testnet
4. **API Deployment**: Deploy backend API to cloud platform (AWS, Azure, GCP)
5. **Frontend Deployment**: Deploy web app to CDN (Vercel, Netlify, CloudFront)
6. **Mobile App**: Build and deploy to app stores

### Docker Deployment
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### CI/CD Pipeline
The project includes GitHub Actions workflows for:
- Automated testing on pull requests
- Code quality checks and linting
- Security vulnerability scanning
- Automated deployment to staging/production

## 🔐 Security

### Security Measures
- **Authentication**: JWT-based secure authentication
- **Input Validation**: Comprehensive request validation with Zod
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured CORS policies for secure cross-origin requests
- **Helmet**: Security headers for HTTP responses
- **Environment Variables**: Secure configuration management
- **Database Security**: MongoDB connection security and data validation

### Security Best Practices
- Regular dependency updates and vulnerability scanning
- Secure API key management
- Input sanitization and validation
- Proper error handling without information disclosure
- Secure blockchain private key management

## 📈 Monitoring & Analytics

### Application Monitoring
- **Logging**: Structured logging with Winston
- **Error Tracking**: Comprehensive error logging and monitoring
- **Performance Monitoring**: API response time tracking
- **Database Monitoring**: MongoDB query performance analysis

### Business Analytics
- **Battery Performance**: Real-time battery health analytics
- **Charging Patterns**: User charging behavior analysis
- **Network Utilization**: Charging station usage statistics
- **User Engagement**: Application usage metrics

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style and standards
- Pull request process
- Issue reporting guidelines
- Development workflow

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Documentation**: `/docs/api/`
- **Integration Guides**: `/docs/integrations/`
- **Developer Guides**: `/docs/development/`

### Community Support
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Discord**: Join our Discord server for real-time support

### Commercial Support
For enterprise support, custom integrations, or commercial licensing, please contact us at support@smartev.com.

## 🗺️ Roadmap

### Phase 1: Core Platform (Current)
- ✅ Backend API with authentication and core features
- ✅ Web dashboard with admin capabilities
- ✅ Mobile application for end users
- ✅ Basic ML analytics and battery tracking
- ✅ Blockchain integration for battery passports

### Phase 2: Advanced Features (Q1 2024)
- 🔄 Advanced AI analytics and predictive modeling
- 🔄 Enhanced mobile app with offline capabilities
- 🔄 Integration with more charging networks
- 🔄 Advanced admin dashboard with analytics
- 🔄 Multi-language support and localization

### Phase 3: Enterprise Features (Q2 2024)
- 📋 Fleet management capabilities
- 📋 Advanced reporting and analytics
- 📋 Enterprise SSO integration
- 📋 API marketplace and third-party integrations
- 📋 Advanced blockchain features and tokenization

### Phase 4: Global Expansion (Q3 2024)
- 📋 International market support
- 📋 Currency and payment gateway integration
- 📋 Compliance with global EV standards
- 📋 Advanced IoT device integration
- 📋 Carbon credit tracking and trading

---

**Built with ❤️ by the SmartEV Team**

*Empowering the future of electric mobility through technology innovation.*
