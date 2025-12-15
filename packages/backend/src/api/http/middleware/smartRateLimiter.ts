/**
 * Mejora 6: Rate Limiting Inteligente por Departamento
 * Diferentes límites según el departamento y tipo de operación
 */
import rateLimit from 'express-rate-limit';
import { getRedisClient, isRedisAvailable } from '../../../infra/cache/redisClient';
import RedisStore from 'rate-limit-redis';
import { logger } from '../../../shared/logger';
import type { Request, Response } from 'express';
import type { RequestWithId } from './requestId';

interface DepartmentLimits {
  chat: { requests: number; window: string };
  upload: { requests: number; window: string };
  invoke: { requests: number; window: string };
}

const DEPARTMENT_LIMITS: Record<string, DepartmentLimits> = {
  CEO: {
    chat: { requests: 200, window: '1h' },
    upload: { requests: 50, window: '1h' },
    invoke: { requests: 300, window: '1h' }
  },
  CTO: {
    chat: { requests: 150, window: '1h' },
    upload: { requests: 30, window: '1h' },
    invoke: { requests: 200, window: '1h' }
  },
  MKT: {
    chat: { requests: 100, window: '1h' },
    upload: { requests: 100, window: '1h' }, // Marketing sube muchas imágenes
    invoke: { requests: 150, window: '1h' }
  },
  default: {
    chat: { requests: 100, window: '1h' },
    upload: { requests: 20, window: '1h' },
    invoke: { requests: 100, window: '1h' }
  }
};



function getDepartmentFromRequest(req: Request): string {
  const deptHeader = req.headers['x-department'] as string;
  if (deptHeader) {
    return deptHeader.toUpperCase();
  }

  // Intentar inferir del path
  if (req.path.includes('/crm')) return 'MKT';
  if (req.path.includes('/invoke')) {
    // Puede venir en el body o query
    return 'default';
  }

  return 'default';
}

function getOperationType(req: Request): 'chat' | 'upload' | 'invoke' {
  if (req.path.includes('/uploads')) return 'upload';
  if (req.path.includes('/invoke')) return 'invoke';
  return 'chat';
}

/**
 * Crear rate limiter inteligente basado en departamento y operación
 */
export function createSmartRateLimiter() {
  let redisStore: RedisStore | undefined = undefined;

  try {
    const redisClient = getRedisClient();
    if (redisClient && isRedisAvailable()) {
      redisStore = new RedisStore({
        prefix: 'rl:smart:',
        sendCommand: (...args: string[]) => {
          const [command, ...commandArgs] = args;
          if (!command) {
            return Promise.reject(new Error('Redis command is required'));
          }
          const result = redisClient!.call(command, ...commandArgs);
          return result as Promise<boolean | number | string | Array<boolean | number | string>>;
        }
      });
      logger.info('[SmartRateLimiter] Usando Redis store');
    } else {
      logger.warn('[SmartRateLimiter] Redis no disponible, usando memory store');
    }
  } catch (error) {
    logger.warn('[SmartRateLimiter] Error inicializando Redis, usando memory store', {
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return rateLimit({
    ...(redisStore ? { store: redisStore } : {}),
    windowMs: 3600000, // 1 hora base (se ajusta dinámicamente)
    max: 100, // Base (se ajusta dinámicamente)
    keyGenerator: (req: Request) => {
      const dept = getDepartmentFromRequest(req);
      const operation = getOperationType(req);
      const userId = (req as Request & { authContext?: { userId?: string } }).authContext?.userId || 'anonymous';
      return `smart:${dept}:${operation}:${userId}`;
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Health checks no tienen límite
      return req.path === '/health' || req.path === '/api/health';
    },
    handler: (req: Request, res: Response) => {
      const reqWithId = req as RequestWithId;
      const dept = getDepartmentFromRequest(req);
      const operation = getOperationType(req);
      const limits = DEPARTMENT_LIMITS[dept] ?? DEPARTMENT_LIMITS['default'];
      const limitConfig = limits?.[operation] ?? limits?.chat ?? { requests: 100, window: '1h' };

      logger.warn('[SmartRateLimiter] Rate limit excedido', {
        department: dept,
        operation,
        path: req.path,
        requestId: reqWithId.id
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        department: dept,
        operation,
        limit: limitConfig.requests,
        window: limitConfig.window,
        retryAfter: limitConfig.window
      });
    }
  });
}

export const smartRateLimiter = createSmartRateLimiter();
