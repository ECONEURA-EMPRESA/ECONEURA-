/**
 * ECONEURA - Knowledge Domain: Upload Document Use Case
 * Caso de uso para subir un documento al sistema RAG
 */
import type { Result } from '../../shared/Result';
import type { Document } from '../domain/Document';
import type { DocumentStore } from '../domain/ports';
import type { StorageService } from '../../infra/storage/StorageService';

export interface UploadDocumentInput {
  userId: string;
  tenantId: string | null;
  file: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
  };
  department: string;
  neura: string;
}

export async function uploadDocument(
  input: UploadDocumentInput,
  deps: {
    documentStore: DocumentStore;
    storageService: StorageService;
  }
): Promise<Result<Document, Error>> {
  const { userId, tenantId, file, department, neura } = input;

  // 1. Subir archivo a storage
  const storagePath = `documents/${userId}/${Date.now()}-${file.originalName}`;
  try {
    await deps.storageService.uploadBuffer(
      file.buffer,
      storagePath,
      file.mimeType
    );

    // uploadBuffer retorna { provider, path }, no Result
    // En producción, esto se ajustará cuando tengamos persistencia real
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Error uploading file to storage')
    };
  }

  // 2. Crear documento en store
  const document: Document = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    tenantId,
    userId,
    department,
    neura,
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    storageProvider: 'azure-blob',
    storagePath,
    status: 'uploaded',
    chunksCount: 0,
    pagesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const saveResult = await deps.documentStore.save(document);
  return saveResult;
}
