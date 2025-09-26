# FlexiEV Chat Integration

This document explains the chat overlay integration added to the FlexiEV React Native app.

## 🚀 Overview

The chat integration provides a floating chat button and full-screen chat modal that connects to the FlexiEV Chat Service (running on port 4500). The chat overlay appears on all screens without modifying existing screen components.

## 📁 File Structure

```
src/
├── api/
│   └── chatApi.ts                 # Chat service API client
├── components/
│   └── ChatOverlay.tsx           # Main chat overlay component
├── contexts/
│   └── ChatContext.tsx          # Chat state management
├── config/
│   └── chatConfig.ts            # Configuration settings
└── App.tsx                      # Updated with chat providers
```

## 🔧 Features

### ✨ Chat Overlay
- **Floating Button**: Bottom-right corner with connection status indicator
- **Message Counter**: Shows unread/total message count
- **Full-Screen Modal**: Native modal with smooth animations
- **Connection Status**: Live indicator showing Groq API connectivity
- **Auto-Reconnect**: Automatic health checks and reconnection

### 💬 Chat Functionality
- **EV Expert Assistant**: Specialized knowledge for Indian EV market
- **Real-Time Messaging**: Instant responses via Groq's Llama3-8B model
- **Message History**: Persistent chat history using AsyncStorage
- **Typing Indicators**: Shows when assistant is responding
- **Error Handling**: Graceful error messages and retry options

### 🎛️ User Controls
- **Clear Chat**: Remove all messages with confirmation
- **Download Chat**: Export conversation history (future feature)
- **Health Check**: Manual connection status refresh
- **Settings**: Access to chat preferences (future feature)

## 🔌 Backend Integration

The chat overlay connects to the FlexiEV Chat Service running on `localhost:4500` with these endpoints:

- `POST /api/chat` - Send messages to EV assistant
- `GET /api/health` - Check service connectivity
- `GET /api/info` - Get service information
- `POST /api/test` - Test API connection

## 📱 Usage

### For Users
1. **Start Chat**: Tap the floating chat button in bottom-right corner
2. **Ask Questions**: Type any EV-related question
3. **View Status**: Connection indicator shows service availability
4. **Clear History**: Use trash icon in header to clear messages

### For Developers
1. **Chat Service**: Ensure the chat service is running on port 4500
2. **Environment**: Update `chatConfig.ts` for production URLs
3. **Customization**: Modify styling in `ChatOverlay.tsx`
4. **State Management**: Access chat state via `useChat()` hook

## 🛠️ Configuration

### Development Setup
```typescript
// src/config/chatConfig.ts
const DEV_CONFIG = {
  CHAT_SERVICE_URL: 'http://localhost:4500',
  ENABLE_DEBUG_LOGS: true,
  AUTO_RECONNECT: true,
  HEALTH_CHECK_INTERVAL: 30000,
};
```

### Production Setup
```typescript
// src/config/chatConfig.ts  
const PROD_CONFIG = {
  CHAT_SERVICE_URL: 'https://your-production-chat-service.com',
  ENABLE_DEBUG_LOGS: false,
  AUTO_RECONNECT: true,
  HEALTH_CHECK_INTERVAL: 60000,
};
```

## 🧩 Architecture

### Component Hierarchy
```
App
├── ChatProvider (Context)
├── AppNavigator (Existing screens)
└── ChatOverlay (Floating overlay)
    ├── FloatingButton
    └── ChatModal
        ├── Header (with controls)
        ├── MessagesList
        └── InputArea
```

### State Management
- **ChatContext**: Global chat state using React Context
- **AsyncStorage**: Persistent message history
- **Real-time Updates**: Automatic UI updates via context

### API Layer
- **chatApi.ts**: Handles all backend communication
- **Error Handling**: Comprehensive error management
- **Retry Logic**: Automatic reconnection attempts
- **Logging**: Debug logs in development mode

## 🔧 Customization

### Styling
Modify `ChatOverlay.tsx` styles:
```typescript
const styles = StyleSheet.create({
  floatingButton: {
    // Customize floating button appearance
  },
  modalContainer: {
    // Customize modal layout
  },
  // ... other styles
});
```

### Positioning
Change overlay position:
```tsx
<ChatOverlay 
  bottom={50}  // Distance from bottom
  right={30}   // Distance from right
/>
```

### Features
Enable/disable features in `chatConfig.ts`:
```typescript
export const CHAT_FEATURES = {
  ENABLE_CHAT_HISTORY: true,
  ENABLE_OFFLINE_MODE: false,
  MAX_MESSAGE_LENGTH: 500,
  MAX_CHAT_HISTORY: 100,
};
```

## 🚨 Troubleshooting

### Common Issues

1. **"Unable to connect to chat service"**
   - Ensure chat service is running on port 4500
   - Check network connectivity
   - Verify `CHAT_SERVICE_URL` in config

2. **Messages not persisting**
   - Check AsyncStorage permissions
   - Verify `ENABLE_CHAT_HISTORY` is true

3. **Overlay not appearing**
   - Ensure `ChatProvider` wraps the app
   - Check if `ChatOverlay` is rendered in App.tsx

### Debug Mode
Enable detailed logging:
```typescript
// src/config/chatConfig.ts
ENABLE_DEBUG_LOGS: true
```

View logs in console:
```
[ChatAPI] Sending message: "How to optimize battery life?"
[ChatAPI] Message sent successfully: {...}
[ChatAPI] Chat history saved: 4 messages
```

## 📈 Performance

### Optimizations
- **Lazy Loading**: Modal content loads only when opened
- **Message Throttling**: Prevents spam requests
- **Memory Management**: Automatic cleanup of old messages
- **Efficient Rendering**: FlatList for large message histories

### Resource Usage
- **Storage**: ~1KB per 50 messages
- **Network**: ~2KB per API request
- **Memory**: ~5MB when active

## 🔮 Future Enhancements

- **Voice Input**: Speech-to-text for messages
- **Image Sharing**: Upload vehicle photos for diagnosis
- **Quick Actions**: Predefined question buttons
- **Push Notifications**: Proactive EV maintenance alerts
- **Offline Mode**: Basic functionality without network

## 💡 Tips

1. **Keep service running**: Start chat service before using the app
2. **Monitor connection**: Red dot indicates connectivity issues
3. **Clear regularly**: Remove old messages to save storage
4. **Use specific questions**: More detailed questions get better responses

## 📞 Support

For issues or questions about the chat integration:
- Check the troubleshooting section above
- Review console logs with debug mode enabled
- Ensure chat service is properly configured and running