import { type Conversation } from '../Conversation';
import { type Message } from '../Message';

export interface ConversationStore {
  createConversation(conversation: Conversation): Promise<void>;
  appendMessage(message: Message): Promise<void>;
  getConversation(id: string): Promise<Conversation | null>;
  getMessages(conversationId: string): Promise<Message[]>;
}

export class InMemoryConversationStore implements ConversationStore {
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message[]>();

  async createConversation(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);
  }

  async appendMessage(message: Message): Promise<void> {
    const existing = this.messages.get(message.conversationId) ?? [];
    existing.push(message);
    this.messages.set(message.conversationId, existing);

    const convo = this.conversations.get(message.conversationId);
    if (convo) {
      this.conversations.set(message.conversationId, {
        ...convo,
        updatedAt: message.createdAt
      });
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) ?? null;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) ?? [];
  }
}

export const inMemoryConversationStore = new InMemoryConversationStore();


