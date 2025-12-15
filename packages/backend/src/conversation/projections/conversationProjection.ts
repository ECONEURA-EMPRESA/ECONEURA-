import type { ConversationEvent } from '../events';
import type { Message } from '../Message';

export interface ConversationReadModel {
  id: string;
  tenantId: string | null;
  neuraId: string;
  userId: string | null;
  messages: Message[];
}

export function projectConversation(
  conversationId: string,
  events: ConversationEvent[]
): ConversationReadModel | null {
  if (events.length === 0) {
    return null;
  }

  let tenantId: string | null = null;
  let neuraId = '';
  let userId: string | null = null;
  const messages: Message[] = [];

  for (const event of events) {
    if (event.type === 'ConversationStarted') {
      tenantId = event.payload.tenantId;
      neuraId = event.payload.neuraId;
      userId = event.payload.userId;
    } else if (event.type === 'MessageAppended') {
      messages.push({
        id: `event-${messages.length + 1}`,
        conversationId,
        tenantId: event.payload.tenantId,
        neuraId: event.payload.neuraId,
        userId: event.payload.userId,
        role: event.payload.role,
        content: event.payload.content,
        correlationId: event.payload.correlationId,
        timestamp: event.timestamp
      } as unknown as Message);
    }
  }

  if (!neuraId) {
    return null;
  }

  return {
    id: conversationId,
    tenantId,
    neuraId,
    userId,
    messages
  };
}


