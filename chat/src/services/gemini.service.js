import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Gemini client configuration and utilities
 */
class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.client.getGenerativeModel({ 
      model: 'gemini-1.5-flash'
    });
  }

  /**
   * Generate chat completion using Gemini API
   * @param {Array} messages - Array of chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Chat completion response
   */
  async generateChatCompletion(messages, options = {}) {
    try {
      // Convert OpenAI format messages to Gemini format
      let prompt = '';
      
      for (const message of messages) {
        if (message.role === 'system') {
          // System message becomes part of the prompt
          prompt += `System: ${message.content}\n\n`;
        } else if (message.role === 'user') {
          prompt += `User: ${message.content}\n\n`;
        } else if (message.role === 'assistant') {
          prompt += `Assistant: ${message.content}\n\n`;
        }
      }
      
      // Remove trailing newlines
      prompt = prompt.trim();
      
      // Generate content using Gemini
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Return in OpenAI-compatible format
      return {
        message: {
          role: 'assistant',
          content: text
        },
        content: text
      };
      
    } catch (error) {
      console.error('Error generating chat completion:', error.message);
      
      // Handle specific Gemini errors
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.');
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Gemini API quota exceeded. Please check your usage limits.');
      } else if (error.message.includes('SAFETY')) {
        throw new Error('Content was blocked by Gemini safety filters. Please rephrase your question.');
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
      const result = await this.model.generateContent('Hello, this is a test message.');
      const response = await result.response;
      return response.text().length > 0;
    } catch (error) {
      console.error('Gemini API connection test failed:', error.message);
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
}

export default GeminiService;