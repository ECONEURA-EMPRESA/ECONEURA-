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
    const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
    const [isDriveConnected, setIsDriveConnected] = useState(false);
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

            if (res.status === 404) {
                // Stale conversation ID, clear it
                console.warn('[Chat] Conversation not found (404), clearing local state to start fresh.');
                setConversationId(null);
                localStorage.removeItem(`econeura_conversation_${activeDept}`);
                setChatMsgs([]);
                return;
            }

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
    }, [activeDept]);

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

            const newAttachment: PendingAttachment = {
                fileId: data.fileId,
                originalName: data.originalName,
                mimeType: data.mimeType,
                size: data.size,
                url: data.publicUrl,
                type: data.type === 'image' ? 'image' : 'file'
            };

            setAttachments(prev => [...prev, newAttachment]);
            toast.success(`Archivo "${data.originalName}" agregado a la biblioteca.`);
        } catch (error) {
            console.error('[Upload] Error:', error);
            toast.error('Error subiendo archivo');
        } finally {
            setIsUploadingAttachment(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [onLogout]);

    const removeAttachment = useCallback((id: string) => {
        setAttachments(prev => prev.filter(a => a.fileId !== id));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const sendChatMessage = useCallback(async () => {
        const text = chatInput.trim();
        if (!text && attachments.length === 0) return;

        const displayText = text || (attachments.length > 0 ? `[${attachments.length} Archivos Adjuntos]` : '');
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
                message: text || `[Analizar ${attachments.length} documentos]`,
                conversationId: conversationId || undefined
            };

            if (attachments.length > 0) {
                // New NotebookLM Format
                payload.files = attachments.map(a => ({
                    id: a.fileId,
                    url: a.url,
                    name: a.originalName,
                    type: a.mimeType
                }));
                // Backwards compat if needed (but we changed backend to look for files)
                payload.file = attachments[0].url;
            }

            // Ensure we use the correct ID format (lowercase, hyphenated)
            const neuraId = dept.id === 'ceo' ? 'neura-ceo' :
                dept.id === 'cmo' ? 'neura-cmo' :
                    dept.id === 'cso' ? 'neura-cso' : 'neura-ceo';

            const res = await fetch(`${apiUrl}/api/neuras/${neuraId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
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
            // NOTEBOOK MODE: Do NOT clear attachments automatically, keep them as context library
            // setAttachments([]); // Commented out to behave like NotebookLM

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
    }, [chatInput, attachments, conversationId, activeDept, dept, onLogout]);

    const connectDrive = () => {
        setIsDriveConnected(true);
        toast.success('Conectado a Google Drive (Service Account). Usa el botón "Adjuntar" para explorar.');
    };

    const addDriveAttachment = useCallback((file: any) => {
        const newAttachment: PendingAttachment = {
            fileId: `driv_${file.id}`,
            originalName: file.name,
            mimeType: file.mimeType,
            size: 0, // Drive API doesn't always return size in search
            url: `drive://id/${file.id}`,
            type: 'file'
        };

        setAttachments(prev => {
            if (prev.some(p => p.fileId === newAttachment.fileId)) return prev;
            return [...prev, newAttachment];
        });
        toast.success(`Enlace a Drive "${file.name}" agregado.`);
    }, []);

    return {
        chatMsgs,
        setChatMsgs,
        chatInput,
        setChatInput,
        isChatLoading,
        attachments,
        isUploadingAttachment,
        fileInputRef,
        handleAttachmentUpload,
        removeAttachment,
        sendChatMessage,
        connectDrive,
        isDriveConnected,
        addDriveAttachment
    };
}
