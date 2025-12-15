export interface DomainEvent {
  type: string;
  aggregateId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export interface EventStore {
  appendEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion?: number
  ): Promise<void>;

  loadEvents(aggregateId: string): Promise<DomainEvent[]>;
}


