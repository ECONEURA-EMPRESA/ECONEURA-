/**
 * ECONEURA - Knowledge Domain: Search Documents Use Case
 * Caso de uso para buscar en documentos (RAG search)
 */
import type { Result } from '../../shared/Result';
import type { DocumentSearchResult } from '../domain/Document';
import type { DocumentChunkStore } from '../domain/ports';

export interface SearchDocumentsInput {
  query: string;
  userId: string;
  department?: string;
  neura?: string;
  topK?: number;
}

export async function searchDocuments(
  input: SearchDocumentsInput,
  deps: { documentChunkStore: DocumentChunkStore }
): Promise<Result<DocumentSearchResult[], Error>> {
  const { query, userId, department, neura, topK = 5 } = input;

  if (query.length < 2) {
    return { success: false, error: new Error('Query must be at least 2 characters') };
  }

  const searchResult = await deps.documentChunkStore.search(query, {
    ...(userId ? { userId } : {}),
    ...(department ? { department } : {}),
    ...(neura ? { neura } : {}),
    topK
  });

  return searchResult;
}

