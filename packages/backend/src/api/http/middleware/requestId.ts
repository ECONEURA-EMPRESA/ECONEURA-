/**
 * Request ID Middleware
 * Añade X-Request-ID único a cada request para tracing
 * Migrado desde ECONEURA-REMOTE/backend/middleware/requestId.js
 */
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger, setCorrelationContext } from '../../../shared/logger';

export interface RequestWithId extends Request {
  id: string;
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Usar X-Request-ID del cliente si existe, sino generar
  const requestId =
    (typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : null) ??
    `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // Añadir a request object (type assertion seguro)
  (req as RequestWithId).id = requestId;

  // Añadir a response headers
  res.setHeader('X-Request-ID', requestId);

  // Establecer contexto de correlación para logging
  setCorrelationContext({ correlationId: requestId });

  // Log request
  logger.info('Request received', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip ?? 'unknown'
  });

  next();
}
