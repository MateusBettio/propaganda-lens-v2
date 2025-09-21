import { useState, useCallback } from 'react';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

interface UseAIChatProps {
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
}

interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

export function useAIChat({ 
  apiKey, 
  model = 'gpt-3.5-turbo',
  systemPrompt = 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.'
}: UseAIChatProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('AI API key not provided');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current history and add user message
      setChatHistory(prevHistory => [...prevHistory, { role: 'user', content: message }]);

      // Use functional update to get the latest history
      const currentHistory = await new Promise<ChatHistory[]>((resolve) => {
        setChatHistory(prevHistory => {
          resolve(prevHistory);
          return prevHistory;
        });
      });

      const openai = createOpenAI({ apiKey });

      const result = await generateText({
        model: openai(model),
        system: systemPrompt,
        messages: currentHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        maxTokens: 1000,
      });

      const assistantResponse = result.text;

      // Add assistant response to history
      setChatHistory(prevHistory => [...prevHistory, { role: 'assistant', content: assistantResponse }]);

      return assistantResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      console.error('AI Chat error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, model, systemPrompt]);

  const clearHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    chatHistory,
    clearHistory,
    clearError,
  };
}