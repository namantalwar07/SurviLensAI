import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppColors } from '../theme';
import { useModelService } from '../services/ModelService';
import { ModelLoaderWidget } from '../components';
import { useAIChat } from '../hooks';

const QUICK_PROMPTS = [
  '💼 Help me with work tasks',
  '🏕️ Outdoor survival tips',
  '🍳 Cooking instructions',
  '📚 Explain a concept',
  '🔧 Fix something broken',
  '💡 Creative ideas',
];

export const AIChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const modelService = useModelService();
  const { messages, isGenerating, sendStreamingMessage, clearMessages } = useAIChat();
  const [inputText, setInputText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, streamingText]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isGenerating) return;

    setInputText('');
    setStreamingText('');

    try {
      await sendStreamingMessage(
        text,
        (token) => setStreamingText(prev => prev + token),
        'You are SurviLens AI, a helpful offline assistant. Answer any question the user has - whether about work, survival, cooking, tech problems, or anything else. Be practical, clear, and helpful.'
      );
      setStreamingText('');
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt.substring(2).trim());
  };

  if (!modelService.isLLMLoaded) {
    return (
      <ModelLoaderWidget
        title="AI Brain Required"
        subtitle="Download AI model to chat about anything"
        icon="chat"
        accentColor={AppColors.accentCyan}
        isDownloading={modelService.isLLMDownloading}
        isLoading={modelService.isLLMLoading}
        progress={modelService.llmDownloadProgress}
        onLoad={modelService.downloadAndLoadLLM}
      />
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🤖</Text>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>Ask me anything!</Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearMessages} style={styles.clearButton}>
            <Text style={styles.clearIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Universal AI Assistant</Text>
            <Text style={styles.emptyText}>
              Ask about work, survival, cooking, tech problems, or anything else. I'm here to help!
            </Text>

            <View style={styles.quickPromptsContainer}>
              <Text style={styles.quickPromptsTitle}>Quick Start:</Text>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleQuickPrompt(prompt)}
                  style={styles.quickPrompt}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.messageRole}>
                  {msg.role === 'user' ? '👤 You' : '🤖 AI'}
                </Text>
                <Text style={styles.messageText}>{msg.content}</Text>
                <Text style={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}

            {/* Streaming Message */}
            {streamingText && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.messageRole}>🤖 AI</Text>
                <Text style={styles.messageText}>{streamingText}</Text>
                <ActivityIndicator size="small" color={AppColors.accentCyan} style={styles.streamingIndicator} />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything..."
            placeholderTextColor={AppColors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isGenerating}
            style={styles.sendButton}
          >
            <LinearGradient
              colors={[AppColors.accentCyan, '#0EA5E9']}
              style={[styles.sendGradient, (!inputText.trim() || isGenerating) && styles.sendDisabled]}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendIcon}>▶</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primaryDark },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 24, color: '#fff', fontWeight: '700' },
  headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { fontSize: 32 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: { fontSize: 20 },

  // Messages
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 10 },
  
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: AppColors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 32 },
  
  quickPromptsContainer: { width: '100%', gap: 8 },
  quickPromptsTitle: { fontSize: 14, fontWeight: '600', color: AppColors.textMuted, marginBottom: 8 },
  quickPrompt: {
    backgroundColor: AppColors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.accentCyan + '33',
  },
  quickPromptText: { fontSize: 14, color: AppColors.textPrimary },

  messageBubble: { marginBottom: 12, padding: 16, borderRadius: 16, maxWidth: '85%' },
  userBubble: {
    backgroundColor: AppColors.accentCyan + '20',
    borderWidth: 1,
    borderColor: AppColors.accentCyan + '40',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: AppColors.surfaceCard,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '20',
    alignSelf: 'flex-start',
  },
  messageRole: { fontSize: 11, fontWeight: '700', color: AppColors.textMuted, marginBottom: 6 },
  messageText: { fontSize: 14, color: AppColors.textPrimary, lineHeight: 20 },
  messageTime: { fontSize: 10, color: AppColors.textMuted, marginTop: 6 },
  streamingIndicator: { marginTop: 8 },

  // Input
  inputContainer: {
    backgroundColor: AppColors.surfaceCard + 'CC',
    borderTopWidth: 1,
    borderTopColor: AppColors.textMuted + '20',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  input: {
    flex: 1,
    backgroundColor: AppColors.primaryMid,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: AppColors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {},
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  sendIcon: { fontSize: 18, color: '#fff', fontWeight: '700' },
});
