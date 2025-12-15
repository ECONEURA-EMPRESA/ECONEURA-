import type { ReadModelStore } from './ReadModelStore';

export interface CosmosReadModelConfig {
  endpoint: string;
  key: string;
  databaseId: string;
  containerId: string;
}

/**
 * Adaptador mínimo a Cosmos DB para read models.
 * En esta fase sólo declaramos el contrato; la implementación real se añadirá más adelante.
 */
export class CosmosReadModelAdapter<TReadModel> implements ReadModelStore<TReadModel> {
  constructor(private readonly config: CosmosReadModelConfig) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upsert(id: string, model: TReadModel): Promise<void> {
    throw new Error('CosmosReadModelAdapter.upsert not implemented yet');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getById(id: string): Promise<TReadModel | null> {
    throw new Error('CosmosReadModelAdapter.getById not implemented yet');
  }
}


