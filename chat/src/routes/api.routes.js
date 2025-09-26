import express from 'express';
import GroqService from '../services/groq.service.js';

const router = express.Router();

// Initialize services
const groqService = new GroqService();

const SYSTEM_MESSAGE = `
You are an advanced EV Battery & Vehicle Assistant specialized in answering queries about electric vehicles (EVs) in India, including brands like Tata, Mahindra, MG, Hyundai, Kia, BYD, and others.

Your purpose is to provide accurate, clear, and useful information based only on official EV manuals, technical documentation, verified specifications, and authentic sources.

Guidelines:
- Cover all aspects of EVs in India: battery (SoH, RUL, charging cycles, warnings, troubleshooting), vehicle performance, charging infrastructure, warranty, and usage best practices.
- Always use simple, human-like language and avoid unnecessary jargon.
- If a query is vague, interpret it intelligently and provide the most relevant and helpful explanation instead of rejecting it.
- Stay factual and grounded in available manuals, datasets, or trusted references — never invent details.
- Structure answers so they are easy to follow, with step-by-step explanations when helpful.

Response Format:
Answer: [Clear and concise explanation]
Reference: [Mention the manual/section/source if available]
`;

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        status: 'unhealthy',
        service: 'EV Assistant API',
        error: 'Groq API key not configured',
        timestamp: new Date().toISOString()
      });
    }

    // Try a simple API call to verify connection
    try {
      const testResult = await groqService.testConnection();
      if (!testResult) {
        throw new Error('Connection test failed');
      }
    } catch (apiError) {
      return res.status(500).json({
        status: 'unhealthy',
        service: 'EV Assistant API',
        error: 'Groq API connection failed',
        details: apiError.message,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'healthy',
      service: 'EV Assistant API',
      timestamp: new Date().toISOString(),
      model: 'llama3-8b-8192',
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'EV Assistant API',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Chat endpoint for EV queries
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Please provide a valid question about EVs'
      });
    }

    // Generate response using Groq with system prompt
    const response = await groqService.generateChatCompletion([
      { role: 'system', content: SYSTEM_MESSAGE },
      { role: 'user', content: message.trim() }
    ]);

    res.json({
      question: message,
      answer: response.content,
      timestamp: new Date().toISOString(),
      model: 'llama3-8b-8192'
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle specific Groq errors
    if (error.message.includes('rate limit') || error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Groq API rate limit reached. Please try again in a moment.'
      });
    }

    if (error.message.includes('API key') || error.status === 401) {
      return res.status(500).json({
        error: 'API configuration error',
        message: 'Groq API key is invalid. Please check your GROQ_API_KEY environment variable.'
      });
    }

    if (error.status === 402) {
      return res.status(402).json({
        error: 'Quota exceeded',
        message: 'Groq API quota exceeded. Please check your usage limits.'
      });
    }

    if (error.status === 400) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Your message was invalid. Please rephrase your question.'
      });
    }

    res.status(500).json({
      error: 'Failed to process your question',
      message: 'Please try again or rephrase your question',
      details: error.message
    });
  }
});

/**
 * Test API connection endpoint
 */
router.post('/test', async (req, res) => {
  try {
    const response = await groqService.generateChatCompletion([
      { role: 'user', content: 'Hello, just testing the connection. Please respond with "Connection successful!"' }
    ]);

    res.json({
      status: 'success',
      message: 'Groq API connection is working',
      response: response.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Groq API connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get service information
 */
router.get('/info', (req, res) => {
  res.json({
    service: 'EV Battery & Vehicle Assistant',
    version: '1.0.0',
    description: 'AI-powered assistant for EV queries in India',
    supportedBrands: [
      'Tata Motors',
      'Mahindra Electric',
      'MG Motor India',
      'Hyundai',
      'Kia',
      'BYD',
      'Other Indian EV brands'
    ],
    capabilities: [
      'Battery health and diagnostics',
      'Charging infrastructure guidance',
      'Vehicle performance optimization',
      'Warranty and maintenance advice',
      'Troubleshooting support'
    ],
    endpoints: {
      chat: 'POST /api/chat - Ask EV-related questions',
      health: 'GET /api/health - Service health check',
      info: 'GET /api/info - Service information'
    }
  });
});

export default router;