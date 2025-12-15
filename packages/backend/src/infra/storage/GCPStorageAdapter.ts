
import { Storage } from '@google-cloud/storage';
import { logger } from '../../shared/logger';
import { env } from '../../config/env';

import { StorageService } from './StorageService';

export interface IFileStorage {
  uploadFile(file: Express.Multer.File, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getSignedUrl(path: string): Promise<string>;
}

export class GCPStorageAdapter implements IFileStorage, StorageService {
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage({
      projectId: env.GCP_PROJECT_ID,
      // Key is auto-detected from Google Application Credentials or Metadata Server (Cloud Run)
    });
    // Default bucket or throw
    this.bucket = env.GCP_STORAGE_BUCKET || `econeura-uploads-${env.GCP_PROJECT_ID}`;
    logger.info('[GCPStorageAdapter] Initialized', { bucket: this.bucket });
  }

  // --- IFileStorage Implementation ---

  async uploadFile(file: Express.Multer.File, destinationPath: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const fileObj = bucket.file(destinationPath);

      await fileObj.save(file.buffer, {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
        },
      });

      return fileObj.publicUrl(); // Or authenticated URL logic
    } catch (error: any) {
      logger.error('[GCPStorageAdapter] Upload failed', { error: error.message });
      throw new Error('GCP Upload Failed');
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await this.storage.bucket(this.bucket).file(path).delete();
    } catch (error: any) {
      logger.warn('[GCPStorageAdapter] Delete failed (might not exist)', { error: error.message });
    }
  }

  async getSignedUrl(path: string): Promise<string> {
    try {
      const [url] = await this.storage.bucket(this.bucket).file(path).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });
      return url;
    } catch (error: any) {
      logger.error('[GCPStorageAdapter] Signing failed', { error: error.message });
      throw new Error('GCP Signing Failed');
    }
  }

  // --- StorageService Implementation ---

  async uploadBuffer(buffer: Buffer, storedName: string, mimeType: string): Promise<{ provider: string; path: string }> {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const fileObj = bucket.file(storedName);

      await fileObj.save(buffer, {
        contentType: mimeType,
      });

      return { provider: 'gcp', path: storedName };
    } catch (error: any) {
      logger.error('[GCPStorageAdapter] uploadBuffer failed', { error: error.message });
      throw new Error('GCP Upload Buffer Failed');
    }
  }

  async downloadToBuffer(provider: string, storagePath: string): Promise<Buffer> {
    try {
      // Ignore provider arg, assume GCP
      const bucket = this.storage.bucket(this.bucket);
      const [buffer] = await bucket.file(storagePath).download();
      return buffer;
    } catch (error: any) {
      logger.error('[GCPStorageAdapter] downloadToBuffer failed', { error: error.message });
      throw new Error('GCP Download Buffer Failed');
    }
  }

  isConfigured(): boolean {
    return !!this.bucket && !!env.GCP_PROJECT_ID;
  }
}
