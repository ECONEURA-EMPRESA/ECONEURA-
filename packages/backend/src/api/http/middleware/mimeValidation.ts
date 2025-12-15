/**
 * ECONEURA - MIME Type Validation Middleware
 * Valida tipos MIME y magic bytes para prevenir uploads maliciosos
 */
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from './requestId';

/**
 * Magic bytes para tipos de archivo comunes
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // PNG
  'image/jpeg': [[0xff, 0xd8, 0xff]], // JPEG
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF
  'text/plain': [], // Sin magic bytes específicos
  'application/json': [[0x7b], [0x5b]], // { o [
  'text/csv': [] // Sin magic bytes específicos
};

/**
 * Validar magic bytes
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expectedBytes = MAGIC_BYTES[mimeType];
  
  // Si no hay magic bytes definidos, permitir (ej: texto plano)
  if (!expectedBytes || expectedBytes.length === 0) {
    return true;
  }

  // Verificar que el buffer tenga al menos el tamaño mínimo
  const minLength = Math.max(...expectedBytes.map((bytes) => bytes.length));
  if (buffer.length < minLength) {
    return false;
  }

  // Verificar que coincida con alguno de los patrones
  return expectedBytes.some((bytes) => {
    return bytes.every((byte, index) => buffer[index] === byte);
  });
}

export interface MimeValidationOptions {
  allowedTypes?: string[]; // Whitelist de tipos MIME permitidos
  validateMagicBytes?: boolean; // Validar magic bytes además de Content-Type
  maxFileSize?: number; // Tamaño máximo en bytes
  errorMessage?: string;
}

/**
 * Middleware de validación de tipos MIME
 */
export function mimeValidationMiddleware(options: MimeValidationOptions = {}) {
  // ✅ SIN RESTRICCIONES: Permitir TODOS los tipos MIME (como ChatGPT/Mistral)
  const allowedTypes = options.allowedTypes ?? []; // Lista vacía = aceptar todos
  const shouldValidateMagicBytes = options.validateMagicBytes ?? false; // Deshabilitar validación de magic bytes
  const maxFileSize = options.maxFileSize ?? 100 * 1024 * 1024; // 100MB por defecto
  const errorMessage = options.errorMessage ?? 'Invalid file type';

  return (req: Request, res: Response, next: NextFunction): void => {
    const reqWithId = req as RequestWithId;

    // ✅ SIN RESTRICCIONES: Permitir TODOS los tipos MIME sin validación
    // Solo validar en rutas de upload si se especifica explícitamente
    if (!req.path.includes('/upload') && !req.path.includes('/library')) {
      next();
      return;
    }

    // ✅ CRÍTICO: Permitir multipart/form-data (multer lo necesita)
    const contentType = req.headers['content-type'] as string | undefined;
    if (!contentType) {
      // Si no hay Content-Type, permitir (puede ser JSON)
      next();
      return;
    }

    // Extraer tipo MIME (ignorar parámetros como charset)
    const mimeType = (contentType.split(';')[0] ?? '').trim().toLowerCase();

    // ✅ CRÍTICO: Permitir multipart/form-data (necesario para multer)
    if (mimeType === 'multipart/form-data') {
      next();
      return;
    }

    // ✅ SIN RESTRICCIONES: Si allowedTypes está vacío, permitir todos
    if (allowedTypes.length === 0) {
      next();
      return;
    }

    // Solo validar si hay tipos específicos permitidos
    if (allowedTypes.length > 0 && !allowedTypes.includes(mimeType)) {
      logger.warn('[MimeValidation] Tipo MIME no permitido', {
        mimeType,
        allowedTypes,
        path: req.path,
        requestId: reqWithId.id
      });

      res.status(400).json({
        success: false,
        error: errorMessage,
        receivedType: mimeType,
        allowedTypes
      });
      return;
    }

    // Validar magic bytes si está habilitado y hay body
    if (shouldValidateMagicBytes && req.body) {
      let buffer: Buffer | null = null;

      if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      } else if (typeof req.body === 'string') {
        buffer = Buffer.from(req.body);
      } else if (typeof req.body === 'object') {
        buffer = Buffer.from(JSON.stringify(req.body));
      }

      if (buffer && buffer.length > 0) {
        // Validar tamaño
        if (buffer.length > maxFileSize) {
          logger.warn('[MimeValidation] Archivo demasiado grande', {
            size: buffer.length,
            maxSize: maxFileSize,
            path: req.path,
            requestId: reqWithId.id
          });

          res.status(413).json({
            success: false,
            error: 'File too large',
            maxSize: maxFileSize,
            receivedSize: buffer.length
          });
          return;
        }

        // Validar magic bytes
        if (mimeType && !validateMagicBytes(buffer, mimeType)) {
          logger.warn('[MimeValidation] Magic bytes no coinciden', {
            mimeType,
            path: req.path,
            requestId: reqWithId.id
          });

          res.status(400).json({
            success: false,
            error: 'File content does not match declared MIME type',
            mimeType
          });
          return;
        }
      }
    }

    next();
  };
}

