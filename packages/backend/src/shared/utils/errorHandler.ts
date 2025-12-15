/**
 * Centralized Error Handler
 * Manejo consistente de errores en toda la API
 * Migrado desde ECONEURA-REMOTE/backend/utils/errorHandler.js
 */
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import type { RequestWithId } from '../../api/http/middleware/requestId';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    metadata?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    if (metadata) {
      this.metadata = metadata;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const reqWithId = req as RequestWithId;
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Si es AppError, usar sus propiedades
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err instanceof Error) {
    message = err.message;
    // Si tiene statusCode (ej: errores de validación Zod)
    if ('statusCode' in err && typeof err.statusCode === 'number') {
      statusCode = err.statusCode;
    }
    if ('code' in err && typeof err.code === 'string') {
      code = err.code;
    }
    if ((err as { type?: string }).type === 'entity.too.large') {
      statusCode = 413;
      message = 'El archivo o payload supera el límite permitido.';
      code = 'PAYLOAD_TOO_LARGE';
    }
  }

  // ✅ Mejora 7: Monitoring automático de errores
  if (err instanceof Error) {
    try {
      // Lazy import para evitar circular dependencies
      import('../../infra/monitoring/errorMonitor').then(({ recordError }) => {
        recordError(err, {
          path: req.path,
          method: req.method,
          userId: (req as Request & { authContext?: { userId?: string } }).authContext?.userId,
          department: req.headers['x-department'] as string,
          correlationId: reqWithId.id
        }).catch(() => {
          // Si falla el monitoring, no es crítico
        });
      }).catch(() => {
        // Si falla importar, no es crítico
      });
    } catch {
      // Si falla, continuar sin monitoring
    }
  }

  // Log error
  logger.error('Error handled', {
    requestId: reqWithId.id ?? 'unknown',
    statusCode,
    code,
    message,
    path: req.path,
    method: req.method,
    stack: err instanceof Error ? err.stack : undefined
  });

  // Response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err instanceof AppError ? err.metadata : undefined
    },
    requestId: reqWithId.id ?? 'unknown',
    timestamp: new Date().toISOString()
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

