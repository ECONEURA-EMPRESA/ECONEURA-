import { useState, useCallback, useRef } from 'react';
import { API_URL } from '../config/api';

interface Reference {
  index: number;
  docId: string;
  title: string;
  pages: string;
  preview: string;
}

interface ChatMessageWithRefs {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: Reference[];
}

interface UseRAGChatOptions {
  neuraId: number;
  department: string;
  useLibrary?: boolean;
  useInternet?: boolean;
  onError?: (error: Error) => void;
}

export function useRAGChat({ neuraId, department, useLibrary = true, useInternet = false, onError }: UseRAGChatOptions) {
  const [messages, setMessages] = useState<ChatMessageWithRefs[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageWithRefs = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/ai-gateway/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: content,
          neuraId,
          useLibrary,
          library: useLibrary ? {
            department,
            neura: department,
            topK: 5
          } : {},
          useInternet
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessageWithRefs = {
        role: 'assistant',
        content: data.data?.output || 'Sin respuesta',
        timestamp: new Date(),
        references: data.data?.references || []
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);

      if (onError) {
        onError(error);
      }

      const errorMessage: ChatMessageWithRefs = {
        role: 'assistant',
        content: `Error: ${error.message}. Por favor, intenta de nuevo.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [neuraId, department, useLibrary, useInternet, onError]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clear
  };
}




