import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getApiUrl, getAuthToken } from '../utils/apiUrl';
import { Department } from '../data/neuraData';

export interface ChatMessage {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    model?: string;
    tokens?: number;
    reasoning_tokens?: number;
    references?: Array<{ index: number; docId: string; title: string; pages: string; preview: string }>;
    function_call?: {
        name: string;
        arguments: Record<string, unknown>;
        status?: string;
        result?: { message?: string };
        hitl_required?: boolean;
    };
}

export interface PendingAttachment {
    fileId: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    type: 'image' | 'file';
}

function correlationId() {
    try {
        const crypto = globalThis.crypto;
        if (!crypto) throw new Error('no crypto');
        const rnd = crypto.getRandomValues(new Uint32Array(4));
        return Array.from(rnd).map((n) => n.toString(16)).join("");
    } catch {
        const r = () => Math.floor(Math.random() * 1e9).toString(16);
        return `${Date.now().toString(16)}${r()}${r()}`;
    }
}

export function useNeuraChat(activeDept: string, dept: Department, onLogout?: () => void) {
    const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Conversation ID management
    const [conversationId, setConversationId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(`econeura_conversation_${activeDept}`);
        }
        return null;
    });

    useEffect(() => {
        const saved = localStorage.getItem(`econeura_conversation_${activeDept}`);
        if (saved !== conversationId) {
            setConversationId(saved);
            if (saved) {
                loadConversationHistory(saved);
            } else {
                setChatMsgs([]);
            }
        }
    }, [activeDept, conversationId]);

    const loadConversationHistory = useCallback(async (convId: string) => {
        try {
            const apiUrl = getApiUrl();
            const token = getAuthToken();
            const res = await fetch(`${apiUrl}/api/conversations/${convId}/messages`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.messages && Array.isArray(data.messages)) {
                    setChatMsgs(data.messages.map((m: any) => ({
                        id: m.id || correlationId(),
                        text: m.content || '',
                        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                        // Map other fields if necessary
                    })));
                }
            }
        } catch (err) {
            console.warn('[Chat] Error cargando historial:', err);
        }
    }, []);

    const handleAttachmentUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
        if (file.size > MAX_UPLOAD_BYTES) {
            toast.warning(`Archivo grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Puede tardar más en procesarse.`);
        }

        try {
            setIsUploadingAttachment(true);
            const apiUrl = getApiUrl();
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('file', file);

            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/api/uploads`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (res.status === 400) {
                const errorData = await res.json().catch(() => ({}));
                toast.error(`Error: ${errorData.error || 'Error al subir archivo'}`);
                return;
            }

            if (res.status === 401) {
                toast.error('Sesión expirada.');
                onLogout?.();
                return;
            }

            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

            const data = await res.json();
            if (!data.success || !data.fileId) throw new Error('Respuesta inválida');

            setPendingAttachment({
                fileId: data.fileId,
                originalName: data.originalName,
                mimeType: data.mimeType,
                size: data.size,
                url: data.publicUrl,
                type: data.type === 'image' ? 'image' : 'file'
            });
            toast.success(`Archivo "${data.originalName}" cargado.`);
        } catch (error) {
            console.error('[Upload] Error:', error);
            toast.error('Error subiendo archivo');
        } finally {
            setIsUploadingAttachment(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [onLogout]);

    const removeAttachment = useCallback(() => {
        setPendingAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const sendChatMessage = useCallback(async () => {
        const text = chatInput.trim();
        if (!text && !pendingAttachment) return;

        const displayText = text || (pendingAttachment ? `[Archivo: ${pendingAttachment.originalName}]` : '');
        const userMsg: ChatMessage = { id: correlationId(), text: displayText, role: 'user' };

        setChatMsgs(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const apiUrl = getApiUrl();
            const token = getAuthToken();
            const chatAgentId = dept.agents[0]?.id || 'a-ceo-01';

            // Optimistic UI update is handled above.
            // Actual API call logic would go here.
            // For now, we'll simulate or implement the fetch.

            const payload: any = {
                message: text,
                agentId: chatAgentId,
                conversationId: conversationId || undefined
            };

            if (pendingAttachment) {
                payload.attachment = {
                    fileId: pendingAttachment.fileId,
                    mimeType: pendingAttachment.mimeType
                };
            }

            const res = await fetch(`${apiUrl}/api/neuras/${dept.neura.title}/chat`, { // Note: URL might need adjustment based on backend routes
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Department': activeDept
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            if (data.conversationId && data.conversationId !== conversationId) {
                setConversationId(data.conversationId);
                localStorage.setItem(`econeura_conversation_${activeDept}`, data.conversationId);
            }

            const assistantMsg: ChatMessage = {
                id: correlationId(),
                text: data.neuraReply || data.response || data.message || 'Sin respuesta',
                role: 'assistant',
                model: data.model,
                tokens: data.usage?.totalTokens
            };

            setChatMsgs(prev => [...prev, assistantMsg]);
            setPendingAttachment(null);

        } catch (error) {
            console.error('[Chat] Error:', error);
            toast.error('Error enviando mensaje');
            setChatMsgs(prev => [...prev, {
                id: correlationId(),
                text: 'Error: No se pudo conectar con NEURA.',
                role: 'assistant'
            }]);
        } finally {
            setIsChatLoading(false);
        }
    }, [chatInput, pendingAttachment, conversationId, activeDept, dept, onLogout]);

    return {
        chatMsgs,
        setChatMsgs,
        chatInput,
        setChatInput,
        isChatLoading,
        pendingAttachment,
        isUploadingAttachment,
        fileInputRef,
        handleAttachmentUpload,
        removeAttachment,
        sendChatMessage
    };
}
