import type { Request, Response, NextFunction } from 'express';
import type { AuthContext } from '../../../shared/types/auth';
import { devAuthService } from '../../../identity/application/authServiceStub';
import { logger, setCorrelationContext } from '../../../shared/logger';

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}

// ✅ Lazy load para evitar errores si firebase-admin no está configurado en dev
let firebaseAuthService: any;

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // DEVELOPMENT BYPASS: Auto-auth en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
      req.authContext = {
        userId: 'dev-user-001',
        tenantId: 'dev-tenant-001',
        roles: ['admin', 'user'],
        sessionId: 'dev-session'
      };
      setCorrelationContext({
        tenantId: 'dev-tenant-001',
        userId: 'dev-user-001'
      });
      next();
      return;
    }

    // PRODUCTION: Real Firebase Auth
    const authHeader = req.headers['authorization'];
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : '';

    let context: AuthContext | null = null;

    if (process.env.NODE_ENV === 'production') {
      if (!firebaseAuthService) {
        const mod = await import('../../../identity/application/firebaseAuthService');
        firebaseAuthService = mod.firebaseAuthService;
      }
      context = await firebaseAuthService.validateSession(token);
    } else {
      context = await devAuthService.validateSession(token);
    }

    if (!context) {
      // ✅ SaaS Friendly: Si no hay auth, devolvemos 401 limpio
      // Excepción: Rutas públicas ya deberían haber sido manejadas antes (server.ts)
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    req.authContext = context;

    // debug logging en prod
    if (process.env.NODE_ENV === 'production') {
      // logger.debug('[AuthMiddleware] Authenticated', { userId: context.userId });
    }

    setCorrelationContext({
      tenantId: context.tenantId,
      userId: context.userId
    });

    next();
  } catch (e) {
    const error = e instanceof Error ? e : new Error('Error en authMiddleware');
    logger.error('[AuthMiddleware] Error critico', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal Auth Error' });
  }
}


