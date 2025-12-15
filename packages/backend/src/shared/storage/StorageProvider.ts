import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';
import { logger } from '../logger';
import { getValidatedEnv } from '../../config/env';

export interface UploadedFile {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string; // Temp path for local processing
    buffer?: Buffer;
}

export interface IStorageProvider {
    uploadFile(file: UploadedFile): Promise<string>; // Returns Public URL
}

/**
 * Local Disk Implementation (Development)
 */
export class LocalStorageProvider implements IStorageProvider {
    async uploadFile(file: UploadedFile): Promise<string> {
        const env = getValidatedEnv();
        const publicBase = env.PUBLIC_UPLOAD_BASE_URL ?? 'http://localhost:3000/uploads';
        return `${publicBase.replace(/\/$/, '')}/${file.filename}`;
    }
}

/**
 * Google Cloud Storage Implementation (Production)
 */
export class GoogleCloudStorageProvider implements IStorageProvider {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        this.storage = new Storage();
        this.bucketName = process.env['GCS_BUCKET_NAME'] || 'econeura-uploads';
    }

    async uploadFile(file: UploadedFile): Promise<string> {
        return new Promise((resolve, reject) => {
            const bucket = this.storage.bucket(this.bucketName);
            const blob = bucket.file(file.filename);

            // If we have a buffer (memory storage), use it. Else use stream from path.
            if (file.path && fs.existsSync(file.path)) {
                fs.createReadStream(file.path)
                    .pipe(blob.createWriteStream({
                        resumable: false,
                        contentType: file.mimetype,
                    }))
                    .on('error', (err) => reject(err))
                    .on('finish', () => {
                        // Make public or sign URL (Assuming public bucket for now or signed url needed)
                        // For SaaS, usually we want signed URLs or public CDN
                        resolve(`https://storage.googleapis.com/${this.bucketName}/${file.filename}`);
                    });
            } else {
                reject(new Error('File source not found'));
            }
        });
    }
}

/**
 * Factory needed for Multer to know where to store *initially* (Disk vs Memory)
 * Multer needs to run BEFORE our provider logic usually.
 * 
 * Strategy:
 * - Dev: Multer -> Disk -> LocalProvider (Just returns URL)
 * - Prod: Multer -> Disk (Temp) -> GCSProvider (Upload & Delete Temp) -> URL
 */
export function getStorageProvider(): IStorageProvider {
    if (process.env['NODE_ENV'] === 'production') {
        return new GoogleCloudStorageProvider();
    }
    return new LocalStorageProvider();
}
