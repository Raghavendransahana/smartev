# FlexiEV Chat Service

A production-ready AI-powered chat service specialized in answering queries about Electric Vehicles (EVs) in India. Built with Node.js, Express, and Groq's ultra-fast inference with Llama3-8B, this service provides expert knowledge about Indian EV brands including Tata, Mahindra, MG, Hyundai, Kia, BYD, and others.

## Features

- **Specialized EV Assistant**: Expert knowledge on Indian EV market and brands
- **Battery & Vehicle Support**: SoH, RUL, charging cycles, troubleshooting guidance
- **Production Ready**: Error handling, logging, and graceful shutdown
- **RESTful API**: Clean endpoints for chat functionality
- **Ultra-Fast Responses**: Groq's lightning-fast inference with Llama3 models

## Quick Start

### 1. Installation

```bash
cd chat
npm install
```

### 2. Environment Setup

Copy the example environment file and add your Groq API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=4500
NODE_ENV=development
ALLOWED_ORIGINS=http://10.10.40.174:3000,http://10.10.40.174:5173
```
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=4500
NODE_ENV=development
ALLOWED_ORIGINS=http://10.10.40.174:3000,http://10.10.40.174:5173
```

### 3. Start the Server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server will start on <http://10.10.40.174:4500>

## API Endpoints

### Chat with EV Assistant

**POST** `/api/chat`

Ask any EV-related question and get expert answers.

```bash
curl -X POST http://10.10.40.174:4500/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How to optimize battery life in Tata Nexon EV?"}'
```

### Service Information

- **GET** `/` - Service information and supported brands
- **GET** `/api/health` - Health check
- **GET** `/api/info` - Detailed service capabilities

## Usage Examples

### 1. Ask Battery Questions

```javascript
const response = await fetch('http://10.10.40.174:4500/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What's the optimal charging pattern for Mahindra e-Verito?"
  })
});

const result = await response.json();
console.log(`Answer: ${result.answer}`);
```

### 2. Vehicle Troubleshooting

```javascript
const response = await fetch('http://10.10.40.174:4500/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "MG ZS EV showing battery warning. What should I check?"
  })
});

const result = await response.json();
console.log(`Solution: ${result.answer}`);
```

## Supported Topics

### Battery Management
- State of Health (SoH) assessment
- Remaining Useful Life (RUL) prediction
- Charging cycle optimization
- Battery diagnostics and warnings

### Vehicle Performance
- Range optimization strategies
- Energy efficiency tips
- Performance troubleshooting
- Maintenance schedules

### Charging Infrastructure
- Home charging setup
- Public charging networks
- Charging time optimization
- Cost-effective charging strategies

### Brand-Specific Support
- **Tata Motors**: Nexon EV, Tigor EV, Tiago EV
- **Mahindra Electric**: eVerito, e2o, eKUV100
- **MG Motor India**: ZS EV, Comet EV
- **Hyundai**: Kona Electric, Ioniq 5
- **Kia**: EV6, e-Niro
- **BYD**: e6, Atto 3

## Configuration

The service uses environment variables for configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=4500
ALLOWED_ORIGINS=http://10.10.40.174:3000,http://10.10.40.174:5173

# Groq Configuration  
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama3-8b-8192
```

## Error Handling

The service includes comprehensive error handling for:

- Groq API rate limits and quota management
- Invalid requests and malformed queries
- Network connectivity issues
- Server resource constraints

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm test` - Run tests (when implemented)

### Project Structure

```text
chat/
├── src/
│   ├── services/
│   │   └── groq.service.js          # Groq API integration
│   ├── routes/
│   │   └── api.routes.js            # REST API endpoints  
│   └── server.js                    # Main server application
├── .env.example                     # Environment template
├── package.json
└── README.md
```

## License

## Security Features

- CORS configuration for allowed origins
- Input validation and sanitization
- Environment variable protection
- Rate limiting protection

## Integration

This chat service integrates seamlessly with the FlexiEV platform:

- Provides expert EV knowledge for Indian market
- Supports multi-brand EV assistance
- Compatible with existing authentication systems
- Easy API integration with frontend applications

## License

Part of the FlexiEV Platform - see main project LICENSE file.