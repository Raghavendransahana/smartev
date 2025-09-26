import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Groq client configuration and utilities
 */
class GroqService {
  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
    
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    this.model = 'llama-3.1-8b-instant';
  }

  /**
   * Generate chat completion using Groq API
   * @param {Array} messages - Array of chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Chat completion response
   */
  async generateChatCompletion(messages, options = {}) {
    try {
      // Groq uses OpenAI-compatible format, so no conversion needed
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1500,
        top_p: options.topP || 0.9,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
        stream: false
      });
      
      // Return in consistent format
      return {
        message: response.choices[0].message,
        content: response.choices[0].message.content,
        usage: response.usage
      };
      
    } catch (error) {
      console.error('Error generating chat completion:', error.message);
      
      // Handle specific Groq errors
      if (error.status === 429) {
        throw new Error('Groq API rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 401) {
        throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY environment variable.');
      } else if (error.status === 402) {
        throw new Error('Groq API quota exceeded. Please check your usage limits.');
      } else if (error.status === 400) {
        throw new Error('Invalid request to Groq API. Please check your input.');
      }
      
      throw new Error(`Failed to generate chat completion: ${error.message}`);
    }
  }

  /**
   * Test the API connection
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: 'Hello, this is a test message.' }
        ],
        max_tokens: 10
      });
      
      return response.choices && response.choices.length > 0;
    } catch (error) {
      console.error('Groq API connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Count tokens in text (approximate)
   * @param {string} text - Text to count tokens for
   * @returns {number} - Approximate token count
   */
  countTokens(text) {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Get available models
   * @returns {Promise<Array>} - List of available models
   */
  async getAvailableModels() {
    try {
      const models = await this.client.models.list();
      return models.data.map(model => model.id);
    } catch (error) {
      console.error('Error fetching models:', error.message);
      return ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
    }
  }
}

export default GroqService;