export interface ReadModelStore<TReadModel> {
  upsert(id: string, model: TReadModel): Promise<void>;
  getById(id: string): Promise<TReadModel | null>;
}


