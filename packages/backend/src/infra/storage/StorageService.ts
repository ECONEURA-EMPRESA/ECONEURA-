/**
 * Puerto para servicios de almacenamiento (Google Cloud Storage, local, etc.)
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

