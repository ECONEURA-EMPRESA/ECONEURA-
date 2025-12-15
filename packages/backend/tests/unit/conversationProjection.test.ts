import { InMemoryEventStore } from '../../src/infra/persistence/InMemoryEventStore';
import type { ConversationEvent } from '../../src/conversation/events';
import { projectConversation } from '../../src/conversation/projections/conversationProjection';

describe('Conversation projection', () => {
  it('debe proyectar una conversación desde eventos ConversationStarted y MessageAppended', async () => {
    const store = new InMemoryEventStore();
    const conversationId = 'conv-1';

    const events: ConversationEvent[] = [
      {
        type: 'ConversationStarted',
        aggregateId: conversationId,
        timestamp: new Date(),
        payload: {
          tenantId: 'tenant-1',
          neuraId: 'neura-ceo',
          userId: 'user-1'
        }
      },
      {
        type: 'MessageAppended',
        aggregateId: conversationId,
        timestamp: new Date(),
        payload: {
          tenantId: 'tenant-1',
          neuraId: 'neura-ceo',
          userId: 'user-1',
          role: 'user',
          content: 'hola',
          correlationId: 'corr-1'
        }
      }
    ];

    await store.appendEvents(conversationId, events);

    const loadedEvents = (await store.loadEvents(conversationId)) as ConversationEvent[];
    const readModel = projectConversation(conversationId, loadedEvents);

    expect(readModel).not.toBeNull();
    if (readModel) {
      expect(readModel.neuraId).toBe('neura-ceo');
      expect(readModel.messages.length).toBe(1);
      expect(readModel.messages[0]?.content).toBe('hola');
    }
  });
});


