import { ok, err, type Result } from '../shared/Result';
import { randomUUID } from 'crypto';
import { conversationStore } from './store';
import { type Message, type MessageRole } from './Message';

export interface AppendMessageInput {
  conversationId: string;
  tenantId?: string | null;
  neuraId?: string | null;
  userId?: string | null;
  role: MessageRole;
  content: string;
  correlationId?: string | null;
}

export async function appendMessage(
  input: AppendMessageInput
): Promise<Result<Message, Error>> {
  if (!input.conversationId) {
    return err(new Error('conversationId is required'));
  }
  if (!input.content) {
    return err(new Error('content is required'));
  }

  const conversation = await conversationStore.getConversation(input.conversationId);
  if (!conversation) {
    return err(new Error('Conversation not found'));
  }

  const message: Message = {
    id: randomUUID(),
    conversationId: input.conversationId,
    tenantId: input.tenantId ?? conversation.tenantId ?? null,
    neuraId: input.neuraId ?? conversation.neuraId ?? null,
    userId: input.userId ?? conversation.userId ?? null,
    role: input.role,
    content: input.content,
    correlationId: input.correlationId ?? null,
    createdAt: new Date()
  };

  await conversationStore.appendMessage(message);

  return ok(message);
}


