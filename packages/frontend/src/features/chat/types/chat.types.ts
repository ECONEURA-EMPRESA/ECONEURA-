export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    neuraId?: string;
    metadata?: Record<string, unknown>;
}

export interface ChatSession {
    id: string;
    neuraId: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageParams {
    content: string;
    neuraId?: string;
    context?: Record<string, unknown>;
}
