import type { EventStore, DomainEvent } from './EventStore';

export class InMemoryEventStore implements EventStore {
  private readonly eventsByAggregate = new Map<string, DomainEvent[]>();

  async appendEvents(
    aggregateId: string,
    events: DomainEvent[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expectedVersion?: number
  ): Promise<void> {
    const existing = this.eventsByAggregate.get(aggregateId) ?? [];
    this.eventsByAggregate.set(aggregateId, [...existing, ...events]);
  }

  async loadEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.eventsByAggregate.get(aggregateId) ?? [];
  }
}


