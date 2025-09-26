/**
 * Chat service configuration
 * Update these values for different environments
 */

// Development configuration
const DEV_CONFIG = {
  CHAT_SERVICE_URL: 'http://localhost:4500',
  ENABLE_DEBUG_LOGS: true,
  AUTO_RECONNECT: true,
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
};

// Production configuration
const PROD_CONFIG = {
  CHAT_SERVICE_URL: 'https://your-production-chat-service.com', // Update this for production
  ENABLE_DEBUG_LOGS: false,
  AUTO_RECONNECT: true,
  HEALTH_CHECK_INTERVAL: 60000, // 60 seconds
};

// Determine if we're in development mode
const __DEV__ = process.env.NODE_ENV === 'development';

// Export the appropriate configuration
export const chatConfig = __DEV__ ? DEV_CONFIG : PROD_CONFIG;

// Export individual config values for convenience
export const {
  CHAT_SERVICE_URL,
  ENABLE_DEBUG_LOGS,
  AUTO_RECONNECT,
  HEALTH_CHECK_INTERVAL,
} = chatConfig;

// EV brands supported by the assistant
export const SUPPORTED_EV_BRANDS = [
  'Tata Motors',
  'Mahindra Electric',
  'MG Motor India',
  'Hyundai',
  'Kia',
  'BYD',
  'Ola Electric',
  'TVS Motor',
  'Bajaj Auto',
  'Hero Electric',
];

// Quick start messages for users
export const QUICK_START_MESSAGES = [
  'How to optimize battery life in my EV?',
  'Best charging practices for Indian conditions?',
  'EV maintenance tips for hot weather?',
  'Compare Tata Nexon EV vs MG ZS EV',
  'Find charging stations near me',
  'Battery degradation signs to watch for',
];

// Chat service feature flags
export const CHAT_FEATURES = {
  ENABLE_CHAT_HISTORY: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_VOICE_INPUT: false, // Future feature
  ENABLE_FILE_SHARING: false, // Future feature
  MAX_MESSAGE_LENGTH: 500,
  MAX_CHAT_HISTORY: 100,
};

export default chatConfig;