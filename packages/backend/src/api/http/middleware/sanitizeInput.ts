/**
 * ECONEURA - Input Sanitization Middleware
 * Sanitiza inputs para prevenir XSS, SQL injection, path traversal
 */
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from './requestId';

/**
 * Caracteres peligrosos para SQL injection
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
  /(--|;|\/\*|\*\/|'|"|`)/g
];

/**
 * Caracteres peligrosos para path traversal
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\./g,
  /\/\.\./g,
  /\.\.\//g,
  /%2e%2e/gi,
  /%2E%2E/gi
];

/**
 * Caracteres peligrosos para XSS
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /<img[^>]*src[^>]*>/gi
];

/**
 * Sanitizar string
 */
function sanitizeString(value: string, options: { allowHtml?: boolean } = {}): string {
  let sanitized = value;

  // Remover SQL injection patterns
  SQL_INJECTION_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remover path traversal patterns
  PATH_TRAVERSAL_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remover XSS patterns (si no se permite HTML)
  if (!options.allowHtml) {
    XSS_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '');
    });
  }

  // Trim y normalizar espacios
  sanitized = sanitized.trim().replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Sanitizar objeto recursivamente
 */
function sanitizeObject(obj: unknown, options: { allowHtml?: boolean } = {}): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizar también las keys
      const sanitizedKey = sanitizeString(key, options);
      sanitized[sanitizedKey] = sanitizeObject(value, options);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitizar nombre de archivo
 */
export function sanitizeFileName(fileName: string): string {
  // Remover path traversal
  let sanitized = fileName.replace(/\.\./g, '').replace(/[/\\]/g, '_');

  // Remover caracteres peligrosos
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

  // Limitar longitud
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  return sanitized.trim();
}

/**
 * Middleware de sanitización de inputs
 */
export function sanitizeInputMiddleware(options: { allowHtml?: boolean } = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const reqWithId = req as RequestWithId;

    try {
      // Sanitizar body
      if (req.body && typeof req.body === 'object') {
        try {
          req.body = sanitizeObject(req.body, options) as typeof req.body;
        } catch {
          // Ignore if read-only
        }
      }

      // Sanitizar query params
      if (req.query && typeof req.query === 'object') {
        try {
          req.query = sanitizeObject(req.query, options) as typeof req.query;
        } catch {
          // Fallback for read-only req.query (e.g. in tests)
          try {
            const sanitized = sanitizeObject(req.query, options) as Record<string, unknown>;
            Object.keys(req.query).forEach(key => delete (req.query as Record<string, any>)[key]);
            Object.assign(req.query, sanitized);
          } catch {
            // Ignore if completely immutable
          }
        }
      }

      // Sanitizar params
      if (req.params && typeof req.params === 'object') {
        try {
          req.params = sanitizeObject(req.params, options) as typeof req.params;
        } catch {
          // Ignore if read-only
        }
      }

      next();
    } catch (error) {
      logger.error('[SanitizeInput] Error sanitizando inputs', {
        error: error instanceof Error ? error.message : String(error),
        requestId: reqWithId.id
      });

      res.status(400).json({
        success: false,
        error: 'Invalid input detected'
      });
    }
  };
}

