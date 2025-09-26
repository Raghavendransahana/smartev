import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { chatApiService, ChatMessage, HealthResponse } from '../api/chatApi';

interface ChatContextType {
  // Chat state
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  isVisible: boolean;
  
  // Health status
  healthStatus: HealthResponse | null;
  lastHealthCheck: Date | null;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => Promise<void>;
  toggleChat: () => void;
  showChat: () => void;
  hideChat: () => void;
  checkHealth: () => Promise<void>;
  clearError: () => void;
  
  // Statistics
  messageCount: number;
  sessionStartTime: Date;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  const [sessionStartTime] = useState(new Date());

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
    performHealthCheck();
  }, []);

  // Auto-save chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      chatApiService.saveChatHistory(messages);
    }
  }, [messages]);

  /**
   * Load chat history from storage
   */
  const loadChatHistory = async () => {
    try {
      const history = await chatApiService.loadChatHistory();
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  /**
   * Send a message to the chat service
   */
  const sendMessage = async (message: string): Promise<void> => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApiService.sendMessage(message);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response.answer,
        sender: 'assistant',
        timestamp: new Date(response.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsConnected(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setIsConnected(false);
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        message: `❌ ${errorMessage}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all chat messages
   */
  const clearChat = async (): Promise<void> => {
    setMessages([]);
    setError(null);
    await chatApiService.clearChatHistory();
  };

  /**
   * Perform health check
   */
  const performHealthCheck = async (): Promise<void> => {
    try {
      const health = await chatApiService.checkHealth();
      setHealthStatus(health);
      setLastHealthCheck(new Date());
      setIsConnected(health.status === 'healthy');
      setError(null);
    } catch (err) {
      console.error('Health check failed:', err);
      setIsConnected(false);
      setError('Unable to connect to chat service');
      setHealthStatus(null);
    }
  };

  /**
   * Manual health check (exposed to UI)
   */
  const checkHealth = async (): Promise<void> => {
    await performHealthCheck();
  };

  /**
   * Chat visibility controls
   */
  const toggleChat = () => setIsVisible(prev => !prev);
  const showChat = () => setIsVisible(true);
  const hideChat = () => setIsVisible(false);
  
  /**
   * Clear error state
   */
  const clearError = () => setError(null);

  /**
   * Calculate statistics
   */
  const messageCount = messages.filter(msg => msg.sender === 'user' || msg.sender === 'assistant').length;

  const contextValue: ChatContextType = {
    // State
    messages,
    isLoading,
    isConnected,
    error,
    isVisible,
    healthStatus,
    lastHealthCheck,
    
    // Actions
    sendMessage,
    clearChat,
    toggleChat,
    showChat,
    hideChat,
    checkHealth,
    clearError,
    
    // Statistics
    messageCount,
    sessionStartTime,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Hook to use chat context
 */
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;