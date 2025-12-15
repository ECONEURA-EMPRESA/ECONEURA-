export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  tenantId?: string | null;
  neuraId?: string | null;
  userId?: string | null;
  role: MessageRole;
  content: string;
  correlationId?: string | null;
  createdAt: Date;
}


