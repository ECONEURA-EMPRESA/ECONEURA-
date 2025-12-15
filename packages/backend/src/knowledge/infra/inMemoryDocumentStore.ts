/**
 * ECONEURA - Knowledge Domain: In-Memory Document Store (Stub)
 * Implementación in-memory para desarrollo y tests
 */
import type { Result } from '../../shared/Result';
import type { Document } from '../domain/Document';
import type { DocumentStore } from '../domain/ports';

export class InMemoryDocumentStore implements DocumentStore {
  private documents: Map<string, Document> = new Map();

  async save(document: Document): Promise<Result<Document, Error>> {
    this.documents.set(document.id, document);
    return { success: true, data: document };
  }

  async findById(id: string, userId: string): Promise<Result<Document | null, Error>> {
    const doc = this.documents.get(id);
    if (!doc) {
      return { success: true, data: null };
    }
    if (doc.userId !== userId) {
      return { success: false, error: new Error('Document not found') };
    }
    return { success: true, data: doc };
  }

  async listByUser(
    userId: string,
    filters?: { department?: string; neura?: string; q?: string }
  ): Promise<Result<Document[], Error>> {
    let docs = Array.from(this.documents.values()).filter((d) => d.userId === userId);

    if (filters?.department) {
      docs = docs.filter((d) => d.department === filters.department);
    }
    if (filters?.neura) {
      docs = docs.filter((d) => d.neura === filters.neura);
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      docs = docs.filter((d) => d.originalName.toLowerCase().includes(q));
    }

    return { success: true, data: docs };
  }

  async delete(id: string, userId: string): Promise<Result<void, Error>> {
    const doc = this.documents.get(id);
    if (!doc || doc.userId !== userId) {
      return { success: false, error: new Error('Document not found') };
    }
    this.documents.delete(id);
    return { success: true, data: undefined };
  }
}

