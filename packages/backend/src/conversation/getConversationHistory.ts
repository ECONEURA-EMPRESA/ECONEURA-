import { ok, err, type Result } from '../shared/Result';
import { conversationStore } from './store';
import { type Message } from './Message';

export async function getConversationHistory(
  conversationId: string
): Promise<Result<Message[], Error>> {
  if (!conversationId) {
    return err(new Error('conversationId is required'));
  }

  const conversation = await conversationStore.getConversation(conversationId);
  if (!conversation) {
    return err(new Error('Conversation not found'));
  }

  const messages = await conversationStore.getMessages(conversationId);

  return ok(messages);
}


