import type { Request, Response, NextFunction } from 'express';
import type { AuthContext } from '../../../shared/types/auth';
import { devAuthService } from '../../../identity/application/authServiceStub';
import { setCorrelationContext } from '../../../shared/logger';

declare module 'express-serve-static-core' {
  interface Request {
    authContext?: AuthContext;
  }
}

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

    const authHeader = req.headers['authorization'];
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : '';

    const context = await devAuthService.validateSession(token);

    if (!context) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    req.authContext = context;

    // Establecer contexto de correlación con tenantId y userId
    setCorrelationContext({
      tenantId: context.tenantId,
      userId: context.userId
    });

    next();
  } catch (e) {
    const error = e instanceof Error ? e : new Error('Error en authMiddleware');
    res.status(500).json({ success: false, error: error.message });
  }
}


