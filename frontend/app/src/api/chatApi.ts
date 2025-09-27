import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAT_SERVICE_URL, ENABLE_DEBUG_LOGS } from '../config/chatConfig';

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatResponse {
  question: string;
  answer: string;
  timestamp: string;
  model: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  timestamp: string;
  model?: string;
  provider?: string;
  error?: string;
}

class ChatApiService {
  private baseURL: string;
  private readonly STORAGE_KEY = '@flexiev_chat_history';
  
  constructor(baseURL?: string) {
    this.baseURL = baseURL || CHAT_SERVICE_URL;
  }

  /**
   * Debug logging utility
   */
  private log(message: string, data?: any) {
    if (ENABLE_DEBUG_LOGS) {
      console.log(`[ChatAPI] ${message}`, data || '');
    }
  }

  /**
   * Send a chat message to the EV Assistant
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    this.log('Sending message', { message });
    
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      this.log('Message sent successfully', data);
      return data;
    } catch (error) {
      this.log('Chat API Error', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          throw new Error('Unable to connect to chat service. Please check your connection.');
        }
        throw error;
      }
      
      throw new Error('Failed to send message. Please try again.');
    }
  }

  /**
   * Check the health status of the chat service
   */
  async checkHealth(): Promise<HealthResponse> {
    this.log('Checking health status');
    
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      this.log('Health check completed', data);
      return data;
    } catch (error) {
      this.log('Health Check Error', error);
      
      // Check for CORS errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Chat service is unreachable. Please ensure the chat server is running and CORS is properly configured.');
      }
      
      throw new Error('Unable to check service health');
    }
  }

  /**
   * Get service information
   */
  async getServiceInfo(): Promise<any> {
    this.log('Getting service info');
    
    try {
      const response = await fetch(`${this.baseURL}/api/info`);
      
      if (!response.ok) {
        throw new Error(`Info request failed: ${response.status}`);
      }

      const data = await response.json();
      this.log('Service info retrieved', data);
      return data;
    } catch (error) {
      this.log('Service Info Error', error);
      throw new Error('Unable to get service information');
    }
  }

  /**
   * Save chat history to local storage
   */
  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
      this.log('Chat history saved', { messageCount: messages.length });
    } catch (error) {
      this.log('Failed to save chat history', error);
    }
  }

  /**
   * Load chat history from local storage
   */
  async loadChatHistory(): Promise<ChatMessage[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const messages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        this.log('Chat history loaded', { messageCount: messages.length });
        return messages;
      }
    } catch (error) {
      this.log('Failed to load chat history', error);
    }
    return [];
  }

  /**
   * Clear chat history from local storage
   */
  async clearChatHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.log('Chat history cleared');
    } catch (error) {
      this.log('Failed to clear chat history', error);
    }
  }

  /**
   * Test the connection to chat service
   */
  async testConnection(): Promise<boolean> {
    this.log('Testing connection');
    
    try {
      const response = await fetch(`${this.baseURL}/api/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const isConnected = response.ok;
      this.log('Connection test completed', { connected: isConnected });
      return isConnected;
    } catch (error) {
      this.log('Connection test failed', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatApiService = new ChatApiService();
export default ChatApiService;