/**
 * Puerto para servicios de almacenamiento (Azure Blob Storage, local, etc.)
 */
export interface StorageService {
  uploadBuffer(
    buffer: Buffer,
    storedName: string,
    mimeType: string
  ): Promise<{ provider: string; path: string }>;
  downloadToBuffer(provider: string, storagePath: string): Promise<Buffer>;
  isConfigured(): boolean;
}

