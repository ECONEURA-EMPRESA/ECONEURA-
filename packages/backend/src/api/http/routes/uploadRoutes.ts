import { Router, type Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { requireRoles } from '../middleware/rbacMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { logger } from '../../../shared/logger';
import { getValidatedEnv } from '../../../config/env';
import type { AuthContext } from '../../../shared/types/auth';

const uploadsDir = path.join(process.cwd(), 'uploads');

function ensureUploadsDir(): void {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (error) {
    logger.error('[UploadRoutes] Error creando directorio de uploads', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }

  const value = Number.parseFloat(match[1] ?? '0');
  const unit = (match[2] ?? 'b').toLowerCase();
  const multiplier = units[unit] ?? 1;

  return Math.floor(value * multiplier);
}

ensureUploadsDir();

const env = getValidatedEnv();
const payloadLimit = env.PAYLOAD_LIMIT ?? '8mb';
const maxUploadBytes = parseSize(payloadLimit);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${randomUUID()}${ext}`;
    cb(null, name);
  }
});

// ✅ SIN RESTRICCIONES: Permitir cualquier tipo y tamaño de archivo (como ChatGPT/Mistral)
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (límite alto pero razonable)
    files: 10, // Permitir múltiples archivos
    fields: 50, // Permitir campos adicionales
    parts: 100 // Permitir múltiples partes
  }
  // ✅ fileFilter removido - aceptar TODOS los tipos de archivo
});

const router = Router();

// ✅ CRÍTICO: El middleware de multer debe ejecutarse ANTES de auth para procesar el archivo
router.post(
  '/',
  // Primero procesar el archivo con multer (sin auth todavía)
  (req, res, next) => {
    // ✅ MEJORA 3: Logging detallado ANTES de multer
    logger.info('[UploadRoutes] Request recibido', {
      method: req.method,
      path: req.path,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : []
    });

    const uploader = upload.single('file');
    uploader(req, res, err => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            logger.warn('[UploadRoutes] Archivo demasiado grande', {
              maxSize: maxUploadBytes,
              error: err.message,
              receivedSize: err.field ? 'unknown' : 'unknown'
            });
            res.status(413).json({
              success: false,
              error: 'El archivo supera el límite permitido.',
              maxSize: maxUploadBytes,
              maxSizeMB: Math.round(maxUploadBytes / 1024 / 1024)
            });
            return;
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            logger.warn('[UploadRoutes] Campo de archivo inesperado', {
              field: err.field,
              error: err.message
            });
            res.status(400).json({
              success: false,
              error: `Campo de archivo incorrecto. Se espera 'file', se recibió '${err.field}'.`,
              expectedField: 'file',
              receivedField: err.field
            });
            return;
          }
          if (err.code === 'LIMIT_PART_COUNT' || err.code === 'LIMIT_FIELD_KEY' || err.code === 'LIMIT_FIELD_VALUE') {
            logger.warn('[UploadRoutes] Límite de multer excedido', {
              code: err.code,
              error: err.message
            });
            res.status(400).json({
              success: false,
              error: `Error en formato de request: ${err.message}`,
              code: err.code
            });
            return;
          }
        }

        // ✅ MEJORA 4: Manejar error de fileFilter (tipo MIME no permitido)
        if (err.message && err.message.includes('Tipo de archivo no permitido')) {
          logger.warn('[UploadRoutes] Tipo de archivo rechazado por fileFilter', {
            error: err.message
          });
          res.status(400).json({
            success: false,
            error: err.message,
            allowedTypes: [
              'image/jpeg', 'image/png', 'image/gif', 'image/webp',
              'application/pdf', 'text/plain', 'text/csv',
              'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
          });
          return;
        }

        logger.error('[UploadRoutes] Error subiendo archivo', {
          error: err instanceof Error ? err.message : String(err),
          code: err instanceof multer.MulterError ? err.code : undefined,
          stack: process.env['NODE_ENV'] === 'development' ? (err instanceof Error ? err.stack : undefined) : undefined
        });

        res.status(500).json({
          success: false,
          error: 'Error subiendo archivo.',
          details: process.env['NODE_ENV'] === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
        });
        return;
      }

      // ✅ MEJORA 3: Logging detallado DESPUÉS de multer
      logger.info('[UploadRoutes] Archivo procesado por multer', {
        hasFile: !!req.file,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        fileMimeType: req.file?.mimetype,
        filePath: req.file?.path
      });

      if (!req.file) {
        logger.warn('[UploadRoutes] Multer no procesó ningún archivo', {
          contentType: req.headers['content-type'],
          bodyKeys: req.body ? Object.keys(req.body) : [],
          hasBody: !!req.body
        });
        res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo. Asegúrate de enviar el archivo en el campo "file".',
          debug: process.env['NODE_ENV'] === 'development' ? {
            contentType: req.headers['content-type'],
            bodyKeys: req.body ? Object.keys(req.body) : []
          } : undefined
        });
        return;
      }

      next();
    });
  },
  // ✅ Agregar autenticación DESPUÉS de procesar el archivo
  authMiddleware,
  requireRoles('admin', 'user'),
  (req, res) => {
    const file = req.file;

    // ✅ MEJORA 5: Validación adicional con información de debug
    if (!file) {
      logger.error('[UploadRoutes] req.file es undefined después de multer', {
        contentType: req.headers['content-type'],
        method: req.method,
        path: req.path,
        bodyKeys: req.body ? Object.keys(req.body) : [],
        hasBody: !!req.body
      });
      return res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo. Verifica que el campo se llame "file" y que el Content-Type sea "multipart/form-data".',
        debug: process.env['NODE_ENV'] === 'development' ? {
          contentType: req.headers['content-type'],
          bodyKeys: req.body ? Object.keys(req.body) : [],
          expectedField: 'file'
        } : undefined
      });
    }

    // ✅ MEJORA 6: Cloud Native Storage Strategy
    const { getStorageProvider } = await import('../../../shared/storage/StorageProvider');
    const storageProvider = getStorageProvider();

    try {
      const publicUrl = await storageProvider.uploadFile({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      });

      // ✅ LOGIC: If Prod (GCS), file is uploaded. We should technically delete the local temp file `file.path`
      // But `multer.diskStorage` keeps it there.
      // Ideally, we switch to `multer.memoryStorage` for GCS, but for now we keep disk as buffer
      // and let Cloud Run execution environment cleanup (ephemeral) or do explicit unlink.
      if (process.env['NODE_ENV'] === 'production') {
        fs.unlink(file.path, (err) => {
          if (err) logger.warn('[UploadRoutes] Failed to cleanup temp file', { error: err.message });
        });
      }

      // ✅ MEJORA 3: Logging detallado del éxito
      // Obtener userId del authContext si existe
      const reqWithAuth = req as Request & { authContext?: AuthContext };
      const userId = reqWithAuth.authContext?.userId;

      logger.info('[UploadRoutes] Archivo subido correctamente', {
        fileId: file.filename,
        provider: process.env['NODE_ENV'] === 'production' ? 'GCS' : 'Local',
        publicUrl,
        userId: userId
      });

      return res.status(201).json({
        success: true,
        fileId: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        publicUrl, // Returns GCS URL in Prod, Local URL in Dev
        type: file.mimetype?.startsWith('image/') ? 'image' : 'file',
        uploadedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('[UploadRoutes] Error en Storage Provider', { error: String(error) });
      return res.status(500).json({ success: false, error: 'Storage Error' });
    }
  }
);

export const uploadRoutes = router;


