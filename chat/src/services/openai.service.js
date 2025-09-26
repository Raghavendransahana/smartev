import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OpenAI client configuration and utilities
 */
class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.chatModel = 'gpt-3.5-turbo';
  }

  /**
   * Generate embeddings for text using OpenAI API
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateEmbedding(text) {
    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text.replace(/\n/g, ' ').trim(),
        encoding_format: 'float',
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate chat completion using OpenAI API
   * @param {Array} messages - Array of chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Chat completion response
   */
  async generateChatCompletion(messages, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1500,
        top_p: options.topP || 0.9,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
      });
      
      return response.choices[0];
    } catch (error) {
      console.error('Error generating chat completion:', error.message);
      throw new Error(`Failed to generate chat completion: ${error.message}`);
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

export default OpenAIService;