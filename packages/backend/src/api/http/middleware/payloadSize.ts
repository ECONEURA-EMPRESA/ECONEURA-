/**
 * ECONEURA - Payload Size Validation Middleware
 * Valida tamaño de payloads para prevenir DoS
 */
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from './requestId';

/**
 * Convertir tamaño humano a bytes
 */
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

export interface PayloadSizeOptions {
  maxSize?: string; // ej: "10mb", "1gb"
  maxSizeBytes?: number; // alternativa a maxSize
  errorMessage?: string;
}

/**
 * Middleware de validación de tamaño de payload
 */
export function payloadSizeMiddleware(options: PayloadSizeOptions = {}) {
  const maxSizeBytes = options.maxSizeBytes ?? (options.maxSize ? parseSize(options.maxSize) : 10 * 1024 * 1024); // 10MB por defecto
  const errorMessage = options.errorMessage ?? 'Payload too large';

  return (req: Request, res: Response, next: NextFunction): void => {
    const reqWithId = req as RequestWithId;

    // Obtener Content-Length
    const contentLength = req.headers['content-length'];
    if (contentLength) {
      const size = Number.parseInt(contentLength, 10);
      if (size > maxSizeBytes) {
        logger.warn('[PayloadSize] Payload demasiado grande', {
          size,
          maxSize: maxSizeBytes,
          path: req.path,
          requestId: reqWithId.id
        });

        res.status(413).json({
          success: false,
          error: errorMessage,
          maxSize: maxSizeBytes,
          receivedSize: size
        });
        return;
      }
    }

    // Nota: La validación de tamaño se hace principalmente con Content-Length header
    // Para validar tamaño acumulado en streaming, se necesitaría middleware más complejo
    // Por ahora, confiamos en Content-Length y límites de Express

    next();
  };
}

