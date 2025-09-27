import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4500;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://10.10.40.174:8081', 
    'http://10.10.40.174:5173', 
    'http://127.0.0.1:5500',
    'http://localhost:8081',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve the HTML frontend at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API status endpoint
app.get('/status', (req, res) => {
  res.json({
    service: 'FlexiEV Chat Service',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    description: 'AI-powered EV assistant for Indian market',
    endpoints: {
      chat: 'POST /api/chat - Ask EV-related questions',
      health: 'GET /api/health - Service health check',
      info: 'GET /api/info - Service information'
    },
    supportedBrands: ['Tata', 'Mahindra', 'MG', 'Hyundai', 'Kia', 'BYD']
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);

  // Groq API errors
  if (error.status === 429 || error.message.includes('rate limit')) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Please try again later'
    });
  }

  if (error.status === 401 || error.message.includes('API key')) {
    return res.status(500).json({
      error: 'API configuration error',
      message: 'Groq API key is invalid or missing'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: error.message || 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/chat',
      'GET /api/info'
    ]
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  const server = app.listen(PORT);
  
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Force close server after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Validate environment variables
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️  Warning: GROQ_API_KEY not found in environment variables');
      console.warn('   Please add your Groq API key to .env file');
    }

    const server = app.listen(PORT, () => {
      console.log('\n🚀 FlexiEV Chat Service Started!');
      console.log(`📡 Server running on http://10.10.40.174:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📋 Available Endpoints:');
      console.log(`   GET  /                 - Service information`);
      console.log(`   GET  /api/health       - Health check`);
      console.log(`   POST /api/chat         - Ask EV questions`);
      console.log(`   GET  /api/info         - Service details`);
      console.log('\n💡 Ready to answer EV questions for Indian market!');
      console.log('� Supported brands: Tata, Mahindra, MG, Hyundai, Kia, BYD');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('   Please try a different port or stop the existing service');
        process.exit(1);
      }
      throw error;
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;