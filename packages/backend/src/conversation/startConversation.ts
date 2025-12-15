import { randomUUID } from 'crypto';
import { ok, err, type Result } from '../shared/Result';
import { type Conversation } from './Conversation';
import { conversationStore } from './store';

export interface StartConversationInput {
  tenantId?: string | null;
  neuraId: string;
  userId?: string | null;
}

export async function startConversation(
  input: StartConversationInput
): Promise<Result<Conversation, Error>> {
  if (!input.neuraId) {
    return err(new Error('neuraId is required'));
  }

  const now = new Date();

  const conversation: Conversation = {
    id: randomUUID(),
    tenantId: input.tenantId ?? null,
    neuraId: input.neuraId,
    userId: input.userId ?? null,
    createdAt: now,
    updatedAt: now
  };

  await conversationStore.createConversation(conversation);

  return ok(conversation);
}


