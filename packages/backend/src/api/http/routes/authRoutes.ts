/**
 * ECONEURA - Auth Routes
 * 
 * Rutas de autenticación (login, register)
 * Usa devAuthService para desarrollo
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { devAuthService } from '../../../identity/application/authServiceStub';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from '../middleware/requestId';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Aplicar rate limiting a todas las rutas de auth
router.use(authLimiter);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

/**
 * POST /api/auth/login
 * Login de usuario
 */
router.post('/login', async (req: Request, res: Response) => {
  const reqWithId = req as RequestWithId;

  try {
    const payload = loginSchema.parse(req.body);
    const result = await devAuthService.login(payload.email, payload.password);

    if (result.success) {
      logger.info('[Auth] Login exitoso', {
        email: payload.email,
        requestId: reqWithId.id
      });

      return res.status(200).json({
        success: true,
        token: result.data.token,
        user: result.data.user
      });
    }

    logger.warn('[Auth] Login fallido', {
      email: payload.email,
      reason: result.error.message,
      requestId: reqWithId.id
    });

    return res.status(401).json({
      success: false,
      error: result.error.message
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues
      });
    }

    logger.error('[Auth] Error en login', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/auth/register
 * Registro de usuario
 */
router.post('/register', async (req: Request, res: Response) => {
  const reqWithId = req as RequestWithId;

  try {
    const payload = registerSchema.parse(req.body);
    const result = await devAuthService.register(
      payload.email,
      payload.password,
      payload.name
    );

    if (result.success) {
      logger.info('[Auth] Registro exitoso', {
        email: payload.email,
        requestId: reqWithId.id
      });

      return res.status(201).json({
        success: true,
        token: result.data.token,
        user: result.data.user
      });
    }

    logger.warn('[Auth] Registro fallido', {
      email: payload.email,
      reason: result.error.message,
      requestId: reqWithId.id
    });

    return res.status(400).json({
      success: false,
      error: result.error.message
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues
      });
    }

    logger.error('[Auth] Error en registro', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export { router as authRoutes };

