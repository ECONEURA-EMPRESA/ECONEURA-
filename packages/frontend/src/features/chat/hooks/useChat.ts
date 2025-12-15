import { useState, useCallback } from 'react';
import { getApiUrl, createAuthHeaders } from '@/utils/apiUrl';
import type { Message } from '../types/chat.types';

/**
 * Hook para gestión de chat con NEURA
 * @param neuraId - ID de la NEURA (opcional)
 * @returns Estado y métodos del chat
 *  @example
 * const { messages, sendMessage, isLoading } = useChat('marketing');
 * await sendMessage('Crea una campaña de email');
 */
export const useChat = (neuraId?: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
            neuraId,
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${getApiUrl()}/api/chat/message`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify({
                    content,
                    neuraId,
                    conversationId: messages[0]?.id || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error('Error sending message');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: data.messageId || Date.now().toString(),
                role: 'assistant',
                content: data.content || data.message || 'No response',
                timestamp: new Date().toISOString(),
                neuraId,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);

            // Add error message to chat
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'system',
                content: `Error: ${errorMessage}`,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [neuraId, messages]);

    const clearHistory = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearHistory,
    };
};
