/**
 * ECONEURA - Knowledge Domain: In-Memory Document Chunk Store (Stub)
 * Implementación in-memory para desarrollo y tests
 */
import type { Result } from '../../shared/Result';
import type { DocumentChunk, DocumentSearchResult } from '../domain/Document';
import type { DocumentChunkStore } from '../domain/ports';

export class InMemoryDocumentChunkStore implements DocumentChunkStore {
  private chunks: Map<string, DocumentChunk> = new Map();

  async saveChunks(chunks: DocumentChunk[]): Promise<Result<void, Error>> {
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }
    return { success: true, data: undefined };
  }

  async deleteChunksByDocumentId(documentId: string): Promise<Result<void, Error>> {
    const chunksToDelete = Array.from(this.chunks.values()).filter((c) => c.documentId === documentId);
    for (const chunk of chunksToDelete) {
      this.chunks.delete(chunk.id);
    }
    return { success: true, data: undefined };
  }

  async search(
    query: string,
    filters?: { userId?: string; department?: string; neura?: string; topK?: number }
  ): Promise<Result<DocumentSearchResult[], Error>> {
    const q = query.toLowerCase();
    let results: DocumentSearchResult[] = [];

    for (const chunk of this.chunks.values()) {
      if (filters?.department && chunk.department !== filters.department) continue;
      if (filters?.neura && chunk.neura !== filters.neura) continue;

      if (chunk.text.toLowerCase().includes(q)) {
        results.push({
          chunkId: chunk.id,
          documentId: chunk.documentId,
          documentName: `Document ${chunk.documentId}`,
          pages: `${chunk.pageFrom}-${chunk.pageTo}`,
          preview: chunk.text.substring(0, 500)
        });
      }
    }

    const topK = filters?.topK ?? 5;
    results = results.slice(0, topK);

    return { success: true, data: results };
  }
}

