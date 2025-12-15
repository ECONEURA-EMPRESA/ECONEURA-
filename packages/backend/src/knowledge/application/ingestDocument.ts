/**
 * ECONEURA - Knowledge Domain: Ingest Document Use Case
 * Caso de uso para ingerir un documento (extraer texto y crear chunks)
 */
import type { Result } from '../../shared/Result';
import type { DocumentChunk } from '../domain/Document';
import type { DocumentStore, DocumentChunkStore, DocumentProcessor } from '../domain/ports';
import type { StorageService } from '../../infra/storage/StorageService';

export interface IngestDocumentInput {
  documentId: string;
  userId: string;
}

export async function ingestDocument(
  input: IngestDocumentInput,
  deps: {
    documentStore: DocumentStore;
    documentChunkStore: DocumentChunkStore;
    documentProcessor: DocumentProcessor;
    storageService: StorageService;
  }
): Promise<Result<{ chunks: number; pages: number }, Error>> {
  const { documentId, userId } = input;

  // 1. Obtener documento
  const docResult = await deps.documentStore.findById(documentId, userId);
  if (!docResult.success) {
    return docResult;
  }

  const document = docResult.data;
  if (!document) {
    return { success: false, error: new Error('Document not found') };
  }

  // 2. Descargar archivo
  let buffer: Buffer;
  try {
    buffer = await deps.storageService.downloadToBuffer(document.storageProvider, document.storagePath);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Error downloading file from storage')
    };
  }

  // 3. Extraer texto
  const extractResult = await deps.documentProcessor.extractText(buffer, document.mimeType);
  if (!extractResult.success) {
    return extractResult;
  }

  const { pages, totalPages } = extractResult.data;

  // 4. Crear chunks
  const chunksResult = deps.documentProcessor.chunkText(pages);
  if (!chunksResult.success) {
    return chunksResult;
  }

  const chunks: DocumentChunk[] = chunksResult.data.map((chunk, index) => ({
    id: `chunk-${documentId}-${index}`,
    documentId,
    department: document.department,
    neura: document.neura,
    pageFrom: chunk.pageFrom,
    pageTo: chunk.pageTo,
    text: chunk.text,
    createdAt: new Date()
  }));

  // 5. Eliminar chunks anteriores y guardar nuevos
  await deps.documentChunkStore.deleteChunksByDocumentId(documentId);
  const saveChunksResult = await deps.documentChunkStore.saveChunks(chunks);
  if (!saveChunksResult.success) {
    return saveChunksResult;
  }

  // 6. Actualizar documento
  document.status = 'ingested';
  document.chunksCount = chunks.length;
  document.pagesCount = totalPages;
  document.updatedAt = new Date();

  await deps.documentStore.save(document);

  return { success: true, data: { chunks: chunks.length, pages: totalPages } };
}

