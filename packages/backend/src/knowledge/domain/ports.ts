/**
 * ECONEURA - Knowledge Domain: Ports (Hexagonal Architecture)
 * Puertos para el dominio de conocimiento/RAG
 */
import type { Result } from '../../shared/Result';
import type { Document, DocumentChunk, DocumentSearchResult } from './Document';

export interface DocumentStore {
  save(document: Document): Promise<Result<Document, Error>>;
  findById(id: string, userId: string): Promise<Result<Document | null, Error>>;
  listByUser(
    userId: string,
    filters?: { department?: string; neura?: string; q?: string }
  ): Promise<Result<Document[], Error>>;
  delete(id: string, userId: string): Promise<Result<void, Error>>;
}

export interface DocumentChunkStore {
  saveChunks(chunks: DocumentChunk[]): Promise<Result<void, Error>>;
  deleteChunksByDocumentId(documentId: string): Promise<Result<void, Error>>;
  search(
    query: string,
    filters?: { userId?: string; department?: string; neura?: string; topK?: number }
  ): Promise<Result<DocumentSearchResult[], Error>>;
}

export interface DocumentProcessor {
  extractText(buffer: Buffer, mimeType: string): Promise<Result<{ pages: string[]; totalPages: number }, Error>>;
  chunkText(pages: string[]): Result<DocumentChunk[], Error>;
}

