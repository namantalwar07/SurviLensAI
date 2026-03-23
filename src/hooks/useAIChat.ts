import { useState, useCallback } from 'react';
import { RunAnywhere } from '@runanywhere/core';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string, systemPrompt?: string) => {
    setIsGenerating(true);
    setError(null);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Build context from conversation history
      const context = messages
        .slice(-6) // Last 6 messages for context
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const prompt = systemPrompt
        ? `${systemPrompt}\n\nConversation:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`
        : context
        ? `${context}\n\nUser: ${userMessage}\n\nAssistant:`
        : userMessage;

      const result = await RunAnywhere.generate(prompt, {
        maxTokens: 300,
        temperature: 0.7,
      });

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);

      return result.text;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [messages]);

  const sendStreamingMessage = useCallback(async (
    userMessage: string,
    onToken: (token: string) => void,
    systemPrompt?: string
  ) => {
    setIsGenerating(true);
    setError(null);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const context = messages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const prompt = systemPrompt
        ? `${systemPrompt}\n\nConversation:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`
        : context
        ? `${context}\n\nUser: ${userMessage}\n\nAssistant:`
        : userMessage;

      const stream = await RunAnywhere.generateStream(prompt, {
        maxTokens: 300,
        temperature: 0.7,
      });

      let fullResponse = '';
      for await (const token of stream.stream) {
        fullResponse += token;
        onToken(token);
      }

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);

      return fullResponse;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Streaming failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  return {
    messages,
    isGenerating,
    error,
    sendMessage,
    sendStreamingMessage,
    clearMessages,
    deleteMessage,
  };
};
