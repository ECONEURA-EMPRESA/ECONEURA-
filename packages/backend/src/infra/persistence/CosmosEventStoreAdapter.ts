import type { EventStore, DomainEvent } from './EventStore';

export interface CosmosEventStoreConfig {
  endpoint: string;
  key: string;
  databaseId: string;
  containerId: string;
}

/**
 * Adaptador mínimo a Cosmos DB para EventStore.
 * En esta fase sólo definimos la forma; la lógica de persistencia real se añadirá más adelante.
 */
export class CosmosEventStoreAdapter implements EventStore {
  constructor(private readonly config: CosmosEventStoreConfig) { }


  async appendEvents(
    _aggregateId: string,
    _events: DomainEvent[],
    _expectedVersion?: number
  ): Promise<void> {
    // Implementación real pendiente (Fase infra avanzada)
    throw new Error('CosmosEventStoreAdapter.appendEvents not implemented yet');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loadEvents(aggregateId: string): Promise<DomainEvent[]> {
    // Implementación real pendiente (Fase infra avanzada)
    throw new Error('CosmosEventStoreAdapter.loadEvents not implemented yet');
  }
}


