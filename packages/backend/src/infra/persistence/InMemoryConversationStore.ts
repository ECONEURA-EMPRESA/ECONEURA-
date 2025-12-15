import { type ConversationStore } from '../../conversation/store/inMemoryConversationStore';
import { type Conversation } from '../../conversation/Conversation';
import { type Message } from '../../conversation/Message';
import { logger } from '../../shared/logger';

export class InMemoryConversationStore implements ConversationStore {
    private conversations: Map<string, Conversation> = new Map();
    private messages: Map<string, Message[]> = new Map();

    async createConversation(conversation: Conversation): Promise<void> {
        this.conversations.set(conversation.id, conversation);
        this.messages.set(conversation.id, []);
        logger.info('[InMemoryConversationStore] Conversation created', { conversationId: conversation.id });
    }

    async appendMessage(message: Message): Promise<void> {
        const msgs = this.messages.get(message.conversationId) || [];
        msgs.push(message);
        this.messages.set(message.conversationId, msgs);

        const conv = this.conversations.get(message.conversationId);
        if (conv) {
            conv.updatedAt = message.createdAt;
            this.conversations.set(message.conversationId, conv);
        }

        logger.info('[InMemoryConversationStore] Message appended', { messageId: message.id });
    }

    async getConversation(id: string): Promise<Conversation | null> {
        return this.conversations.get(id) || null;
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        return this.messages.get(conversationId) || [];
    }
}
