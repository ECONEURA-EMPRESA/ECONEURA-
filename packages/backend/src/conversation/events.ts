import type { DomainEvent } from '../infra/persistence/EventStore';

export type ConversationEventType = 'ConversationStarted' | 'MessageAppended';

export interface ConversationStartedEvent extends DomainEvent {
  type: 'ConversationStarted';
  payload: {
    tenantId: string | null;
    neuraId: string;
    userId: string | null;
  };
}

export interface MessageAppendedEvent extends DomainEvent {
  type: 'MessageAppended';
  payload: {
    tenantId: string | null;
    neuraId: string;
    userId: string | null;
    role: 'user' | 'assistant' | 'system';
    content: string;
    correlationId: string | null;
  };
}

export type ConversationEvent = ConversationStartedEvent | MessageAppendedEvent;


