/**
 * ECONEURA - Security Middleware Composite
 * Middleware compuesto que incluye todas las protecciones de seguridad
 */
import type { Request, Response, NextFunction } from 'express';
import { sanitizeInputMiddleware } from './sanitizeInput';
import { payloadSizeMiddleware } from './payloadSize';
import { csrfMiddleware, csrfTokenMiddleware } from './csrf';
import { mimeValidationMiddleware } from './mimeValidation';
import { userRateLimiter } from './userRateLimiter';

export interface SecurityMiddlewareOptions {
  enableSanitization?: boolean;
  enablePayloadSize?: boolean;
  enableCSRF?: boolean;
  enableMimeValidation?: boolean;
  enableUserRateLimit?: boolean;
  payloadMaxSize?: string;
  csrfExclude?: string[];
  allowedMimeTypes?: string[];
}

/**
 * Middleware de seguridad compuesto
 */
export function securityMiddleware(options: SecurityMiddlewareOptions = {}) {
  const {
    enableSanitization = true,
    enablePayloadSize = true,
    enableCSRF = true,
    enableMimeValidation = true,
    enableUserRateLimit = false, // Por defecto deshabilitado (ya hay rate limiting global)
    payloadMaxSize = '10mb',
    csrfExclude = ['/api/metrics', '/health'],
    allowedMimeTypes
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Aplicar middlewares en orden


    const middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

    // 1. Sanitización de inputs
    if (enableSanitization) {
      middlewares.push(sanitizeInputMiddleware());
    }

    // 2. Validación de tamaño de payload
    if (enablePayloadSize) {
      middlewares.push(payloadSizeMiddleware({ maxSize: payloadMaxSize }));
    }

    // 3. CSRF token (para GET requests)
    if (enableCSRF) {
      middlewares.push(csrfTokenMiddleware({ exclude: csrfExclude }));
    }

    // 4. Validación de tipos MIME
    if (enableMimeValidation) {
      middlewares.push(mimeValidationMiddleware(allowedMimeTypes ? { allowedTypes: allowedMimeTypes } : {}));
    }

    // 5. Rate limiting por usuario (opcional, ya hay rate limiting global)
    if (enableUserRateLimit) {
      middlewares.push(userRateLimiter);
    }

    // 6. CSRF protection (para métodos mutantes)
    if (enableCSRF) {
      middlewares.push(csrfMiddleware({ exclude: csrfExclude }));
    }

    // Ejecutar middlewares en secuencia
    const runMiddleware = (index: number): void => {
      if (index >= middlewares.length) {
        next();
        return;
      }

      middlewares[index]?.(req, res, () => {
        runMiddleware(index + 1);
      });
    };

    runMiddleware(0);
  };
}

/**
 * Configuración de seguridad por defecto
 */
// ✅ SIN RESTRICCIONES: Límite alto para permitir archivos grandes
const DEFAULT_PAYLOAD_LIMIT = process.env['PAYLOAD_LIMIT'] ?? '50mb';

export const defaultSecurityMiddleware = securityMiddleware({
  enableSanitization: true,
  enablePayloadSize: true,
  enableCSRF: process.env['NODE_ENV'] === 'production', // Solo en producción
  enableMimeValidation: true,
  enableUserRateLimit: false, // Ya hay rate limiting global
  payloadMaxSize: DEFAULT_PAYLOAD_LIMIT,
  csrfExclude: ['/api/metrics', '/health', '/api/health', '/api/auth'],
  allowedMimeTypes: [
    'application/pdf',
    'text/plain',
    'application/json',
    'text/csv',
    'image/png',
    'image/jpeg',
    'image/gif'
  ]
});

