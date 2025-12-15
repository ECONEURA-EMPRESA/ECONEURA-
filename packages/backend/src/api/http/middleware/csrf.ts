/**
 * ECONEURA - CSRF Protection Middleware
 * Protección contra Cross-Site Request Forgery
 */
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from './requestId';

export interface CSRFOptions {
  exclude?: string[]; // Rutas excluidas (ej: ['/api/metrics', '/health'])
  cookieName?: string;
  headerName?: string;
  secret?: string; // Secret para firmar tokens (opcional, se genera automáticamente)
}

/**
 * Generar token CSRF
 */
function generateToken(secret: string): string {
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Date.now().toString();
  const data = `${randomBytes.toString('hex')}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex');
  return `${data}:${signature}`;
}

/**
 * Validar token CSRF
 */
function validateToken(token: string, secret: string): boolean {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const [randomBytes, timestamp, signature] = parts;
    if (!randomBytes || !timestamp || !signature) {
      return false;
    }
    const data = `${randomBytes}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    // Validar firma
    if (signature !== expectedSignature) {
      return false;
    }

    // Validar expiración (tokens válidos por 1 hora)
    const tokenTimestamp = Number.parseInt(timestamp, 10);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hora

    if (now - tokenTimestamp > maxAge) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Middleware de protección CSRF
 */
export function csrfMiddleware(options: CSRFOptions = {}) {
  const exclude = options.exclude ?? ['/api/metrics', '/health'];
  const cookieName = options.cookieName ?? 'csrf-token';
  const headerName = options.headerName ?? 'x-csrf-token';
  
  // Generar secret si no se proporciona
  const envSecret = process.env['CSRF_SECRET'];
  const secret = options.secret ?? (envSecret && typeof envSecret === 'string' ? envSecret : crypto.randomBytes(32).toString('hex'));

  return (req: Request, res: Response, next: NextFunction): void => {
    const reqWithId = req as RequestWithId;

    // Excluir rutas específicas
    if (exclude.some((path) => req.path.startsWith(path))) {
      next();
      return;
    }

    // Solo validar métodos mutantes
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!mutatingMethods.includes(req.method)) {
      next();
      return;
    }

    // Obtener token de cookie
    const cookieToken = req.cookies?.[cookieName] as string | undefined;

    // Obtener token de header
    const headerToken = req.headers[headerName.toLowerCase()] as string | undefined;

    // Validar que ambos tokens existan y coincidan
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      logger.warn('[CSRF] Token inválido o faltante', {
        path: req.path,
        method: req.method,
        hasCookieToken: !!cookieToken,
        hasHeaderToken: !!headerToken,
        tokensMatch: cookieToken === headerToken,
        requestId: reqWithId.id
      });

      res.status(403).json({
        success: false,
        error: 'CSRF token validation failed'
      });
      return;
    }

    // Validar token
    if (!cookieToken || !validateToken(cookieToken, secret as string)) {
      logger.warn('[CSRF] Token inválido o expirado', {
        path: req.path,
        method: req.method,
        requestId: reqWithId.id
      });

      res.status(403).json({
        success: false,
        error: 'CSRF token invalid or expired'
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para generar y enviar token CSRF (para GET requests)
 */
export function csrfTokenMiddleware(options: CSRFOptions = {}) {
  const cookieName = options.cookieName ?? 'csrf-token';
  const secret = options.secret ?? process.env['CSRF_SECRET'] ?? crypto.randomBytes(32).toString('hex');

  return (req: Request, res: Response, next: NextFunction): void => {
    // Solo para métodos seguros (GET, HEAD, OPTIONS)
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }

    // Generar token si no existe en cookie
    if (!req.cookies?.[cookieName]) {
      const token = generateToken(secret as string);
      res.cookie(cookieName, token, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000 // 1 hora
      });
    }

    next();
  };
}

