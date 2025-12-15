import { useState, useCallback } from 'react';
import { API_URL } from '../config/api';
import { getAccessToken, getAuthHeader } from '../utils/auth';

interface ReasoningStep {
  step: number;
  actor: string;
  action: string;
  content: string;
  reasoning?: string;
  timestamp: string;
  isFinal?: boolean;
}

export function useMultiActorChat() {
  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askMultiActor = useCallback(async (question: string, context: any = {}) => {
    setSteps([]);
    setError(null);
    setIsStreaming(true);

    try {
      // Opción 1: Streaming con SSE
      const token = getAccessToken();
      const queryParams = new URLSearchParams({
        question,
        context: JSON.stringify(context)
      });

      const eventSource = new EventSource(
        `${API_URL}/multi-actor/stream?${queryParams}&token=${token}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'step') {
          setSteps(prev => [...prev, data.data]);
        } else if (data.type === 'done') {
          setIsStreaming(false);
          eventSource.close();
        } else if (data.type === 'error') {
          setError(data.message);
          setIsStreaming(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (_err) => {
        setError('Error de conexión streaming');
        setIsStreaming(false);
        eventSource.close();

        // Fallback a llamada normal sin streaming
        askMultiActorFallback(question, context);
      };

    } catch (err: any) {
      setError(err.message || 'Error ejecutando multi-actor');
      setIsStreaming(false);
    }
  }, []);

  const askMultiActorFallback = useCallback(async (question: string, context: any = {}) => {
    try {
      const response = await fetch(`${API_URL}/multi-actor/ask`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader() || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, context })
      });

      if (!response.ok) {
        throw new Error('Error en multi-actor');
      }

      const data = await response.json();
      setSteps(data.steps || []);
      setIsStreaming(false);

    } catch (err: any) {
      setError(err.message);
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    steps,
    isStreaming,
    error,
    askMultiActor,
    reset
  };
}
