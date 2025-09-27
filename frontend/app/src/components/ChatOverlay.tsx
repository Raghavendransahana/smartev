import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChat } from '../contexts/ChatContext';
import { ChatMessage } from '../api/chatApi';

const { width, height } = Dimensions.get('window');

interface ChatOverlayProps {
  bottom?: number;
  right?: number;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ 
  bottom = 70, 
  right = 20 
}) => {
  const {
    messages,
    isLoading,
    isConnected,
    error,
    isVisible,
    sendMessage,
    clearChat,
    toggleChat,
    hideChat,
    checkHealth,
    clearError,
    messageCount,
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(message);
      // Auto scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  /**
   * Handle clear chat with confirmation
   */
  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearChat },
      ]
    );
  };

  /**
   * Render individual chat message
   */
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.assistantMessage
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.assistantMessageText
          ]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  /**
   * Render welcome message when no messages exist
   */
  const renderWelcomeMessage = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>🚗 FlexiEV Assistant</Text>
      <Text style={styles.welcomeSubtitle}>
        Your expert guide for Electric Vehicles in India
      </Text>
      <Text style={styles.welcomeText}>
        Ask me about battery health, charging strategies, troubleshooting, or any EV-related topic!
      </Text>
      <View style={styles.brandTags}>
        {['Tata', 'Mahindra', 'MG Motor', 'Hyundai', 'Kia', 'BYD'].map((brand) => (
          <View key={brand} style={styles.brandTag}>
            <Text style={styles.brandTagText}>{brand}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  /**
   * Render typing indicator
   */
  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, styles.assistantMessage, styles.typingBubble]}>
          <Text style={styles.typingText}>EV Assistant is typing</Text>
          <ActivityIndicator size="small" color="#666" style={styles.typingIndicator} />
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { bottom, right },
          !isConnected && styles.floatingButtonDisconnected
        ]}
        onPress={toggleChat}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isConnected ? ['#013734', '#015c4f'] : ['#ef4444', '#dc2626']}
          style={styles.floatingButtonGradient}
        >
          <Ionicons
            name={isVisible ? 'close' : 'chatbubble-ellipses'}
            size={24}
            color="white"
          />
          {messageCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {messageCount > 99 ? '99+' : messageCount}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={hideChat}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <LinearGradient
            colors={['#013734', '#015c4f']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>🚗 FlexiEV Assistant</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: isConnected ? '#4ade80' : '#ef4444' }
                  ]} />
                  <Text style={styles.statusText}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={checkHealth}
                  style={styles.headerButton}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleClearChat}
                  style={styles.headerButton}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={hideChat}
                  style={styles.headerButton}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}

          {/* Messages */}
          <View style={styles.messagesContainer}>
            {messages.length === 0 ? (
              renderWelcomeMessage()
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }}
                ListFooterComponent={renderTypingIndicator}
              />
            )}
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask me anything about EVs..."
              placeholderTextColor="#9ca3af"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={500}
              editable={!isLoading && isConnected}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputMessage.trim() || isLoading || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !isConnected}
            >
              <LinearGradient
                colors={['#013734', '#015c4f']}
                style={styles.sendButtonGradient}
              >
                <Ionicons 
                  name={isLoading ? 'hourglass' : 'send'} 
                  size={20} 
                  color="white" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Floating Button
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonDisconnected: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Error Banner
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderBottomColor: '#fecaca',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 14,
  },

  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },

  // Welcome Message
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  brandTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  brandTag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    margin: 4,
  },
  brandTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },

  // Messages
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  userMessage: {
    backgroundColor: '#013734',
  },
  assistantMessage: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#334155',
  },
  timestamp: {
    fontSize: 11,
    color: '#94a3b8',
    marginHorizontal: 4,
  },

  // Typing Indicator
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginRight: 8,
  },
  typingIndicator: {
    marginLeft: 8,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatOverlay;