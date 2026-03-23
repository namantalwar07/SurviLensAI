import { RunAnywhere } from '@runanywhere/core';

/**
 * ConversationService - Manages multi-turn conversations with context
 *
 * Maintains conversation history and provides context-aware responses
 * for natural, flowing dialogue.
 */

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    imageAnalysis?: any;
    location?: {
      latitude: number;
      longitude: number;
    };
    context?: 'emergency' | 'food' | 'general';
  };
}

export interface ConversationContext {
  id: string;
  messages: ConversationMessage[];
  createdAt: Date;
  lastActivity: Date;
  context?: 'emergency' | 'food' | 'general' | 'navigation';
  language: 'en' | 'hi';
}

export class ConversationService {
  private static instance: ConversationService;
  private conversations: Map<string, ConversationContext> = new Map();
  private currentConversationId: string | null = null;
  private maxHistoryLength = 20; // Keep last 20 messages

  private constructor() {}

  static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  /**
   * Start a new conversation
   */
  startConversation(
    context?: 'emergency' | 'food' | 'general' | 'navigation',
    language: 'en' | 'hi' = 'en'
  ): string {
    const id = `conv_${Date.now()}`;
    const systemPrompt = this.getSystemPrompt(context, language);

    const conversation: ConversationContext = {
      id,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      lastActivity: new Date(),
      context,
      language,
    };

    this.conversations.set(id, conversation);
    this.currentConversationId = id;

    return id;
  }

  /**
   * Add a message to the conversation
   */
  addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: ConversationMessage['metadata']
  ): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.messages.push({
      role,
      content,
      timestamp: new Date(),
      metadata,
    });

    conversation.lastActivity = new Date();

    // Trim history if too long (keep system message + recent messages)
    if (conversation.messages.length > this.maxHistoryLength + 1) {
      const systemMsg = conversation.messages[0];
      const recentMsgs = conversation.messages.slice(-this.maxHistoryLength);
      conversation.messages = [systemMsg, ...recentMsgs];
    }
  }

  /**
   * Generate a response in the conversation
   */
  async generateResponse(
    conversationId: string,
    userMessage: string,
    metadata?: ConversationMessage['metadata']
  ): Promise<string> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add user message
    this.addMessage(conversationId, 'user', userMessage, metadata);

    // Build context prompt from conversation history
    const prompt = this.buildContextualPrompt(conversation);

    // Generate response using LLM
    const result = await RunAnywhere.generate(prompt, {
      maxTokens: 250,
      temperature: 0.7,
    });

    // Add assistant response
    this.addMessage(conversationId, 'assistant', result.text);

    return result.text;
  }

  /**
   * Generate streaming response in the conversation
   */
  async generateStreamingResponse(
    conversationId: string,
    userMessage: string,
    onToken: (token: string) => void,
    metadata?: ConversationMessage['metadata']
  ): Promise<string> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add user message
    this.addMessage(conversationId, 'user', userMessage, metadata);

    // Build context prompt
    const prompt = this.buildContextualPrompt(conversation);

    // Stream response
    const streamResult = await RunAnywhere.generateStream(prompt, {
      maxTokens: 250,
      temperature: 0.7,
    });

    let fullResponse = '';
    for await (const token of streamResult.stream) {
      fullResponse += token;
      onToken(token);
    }

    // Add assistant response
    this.addMessage(conversationId, 'assistant', fullResponse);

    return fullResponse;
  }

  /**
   * Build contextual prompt from conversation history
   */
  private buildContextualPrompt(conversation: ConversationContext): string {
    const messages = conversation.messages
      .filter((msg) => msg.role !== 'system')
      .slice(-6) // Last 6 messages (3 exchanges)
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    return messages;
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): ConversationContext | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Get current active conversation
   */
  getCurrentConversation(): ConversationContext | null {
    if (!this.currentConversationId) return null;
    return this.conversations.get(this.currentConversationId) || null;
  }

  /**
   * Clear a conversation
   */
  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  /**
   * Clear all conversations
   */
  clearAllConversations(): void {
    this.conversations.clear();
    this.currentConversationId = null;
  }

  /**
   * Get system prompt based on context and language
   */
  private getSystemPrompt(
    context?: 'emergency' | 'food' | 'general' | 'navigation',
    language: 'en' | 'hi' = 'en'
  ): string {
    const prompts = {
      en: {
        emergency:
          'You are SurviLens AI, an emergency assistant. Provide clear, step-by-step first aid and safety guidance. Prioritize life-saving information. Keep responses concise and actionable.',
        food: 'You are SurviLens AI, a food safety and nutrition assistant. Help users identify food, check safety, and provide nutritional information. Warn about allergens and health risks.',
        navigation:
          'You are SurviLens AI, a navigation assistant. Help users understand their surroundings, find directions, and mark important locations. Provide practical travel guidance.',
        general:
          'You are SurviLens AI, an offline assistant that helps users understand their environment. Provide helpful, accurate, and practical information. Keep responses concise and friendly.',
      },
      hi: {
        emergency:
          'आप SurviLens AI हैं, एक आपातकालीन सहायक। स्पष्ट, चरण-दर-चरण प्राथमिक चिकित्सा और सुरक्षा मार्गदर्शन प्रदान करें। जीवन रक्षक जानकारी को प्राथमिकता दें। संक्षिप्त और कार्रवाई योग्य उत्तर दें।',
        food: 'आप SurviLens AI हैं, एक खाद्य सुरक्षा और पोषण सहायक। उपयोगकर्ताओं को भोजन पहचानने, सुरक्षा जांचने और पोषण संबंधी जानकारी प्रदान करने में मदद करें। एलर्जी और स्वास्थ्य जोखिमों के बारे में चेतावनी दें।',
        navigation:
          'आप SurviLens AI हैं, एक नेविगेशन सहायक। उपयोगकर्ताओं को उनके परिवेश को समझने, दिशा खोजने और महत्वपूर्ण स्थानों को चिह्नित करने में मदद करें। व्यावहारिक यात्रा मार्गदर्शन प्रदान करें।',
        general:
          'आप SurviLens AI हैं, एक ऑफ़लाइन सहायक जो उपयोगकर्ताओं को उनके परिवेश को समझने में मदद करता है। सहायक, सटीक और व्यावहारिक जानकारी प्रदान करें। संक्षिप्त और मित्रवत उत्तर दें।',
      },
    };

    return prompts[language][context || 'general'];
  }

  /**
   * Export conversation for sharing or storage
   */
  exportConversation(conversationId: string): string {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return JSON.stringify(conversation, null, 2);
  }

  /**
   * Get conversation summary
   */
  getSummary(conversationId: string): {
    messageCount: number;
    duration: number;
    context?: string;
  } {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return {
      messageCount: conversation.messages.length - 1, // Exclude system message
      duration: conversation.lastActivity.getTime() - conversation.createdAt.getTime(),
      context: conversation.context,
    };
  }
}

export default ConversationService.getInstance();
