/**
 * ECONEURA - User-based Rate Limiting Middleware
 * Rate limiting por usuario (no solo IP) con Redis
 */
import type { Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, isRedisAvailable } from '../../../infra/cache/redisClient';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from './requestId';
import type { AuthContext } from '../../../shared/types/auth';

export interface UserRateLimitTier {
  requests: number;
  window: string; // ej: "1h", "15m", "1d"
}

export interface UserRateLimitConfig {
  free?: UserRateLimitTier;
  pro?: UserRateLimitTier;
  enterprise?: UserRateLimitTier;
  defaultTier?: 'free' | 'pro' | 'enterprise';
  keyGenerator?: (_req: Request) => string; // Función para generar key única por usuario
}

/**
 * Parsear ventana de tiempo a milisegundos
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}`);
  }

  const value = Number.parseInt(match[1] ?? '1', 10);
  const unit = match[2] ?? 'm';

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * (multipliers[unit] ?? 60000);
}

/**
 * Obtener tier del usuario (por ahora todos son 'free', extensible)
 */
function getUserTier(_req: Request): 'free' | 'pro' | 'enterprise' {
  // ✅ AUDITORÍA: FUTURO - Obtener tier real del usuario desde base de datos
  // Por ahora, todos los usuarios tienen tier 'free' (sin restricciones adicionales)
  // const authContext = (req as Request & { authContext?: AuthContext }).authContext;

  // Si hay authContext, podríamos obtener tier del usuario
  // Por ahora, retornar default
  return 'free';
}

/**
 * Generar key única para rate limiting por usuario
 */
function generateUserKey(req: Request): string {
  const authContext = (req as Request & { authContext?: AuthContext }).authContext;
  // const reqWithId = req as RequestWithId;

  // Prioridad: userId > tenantId > IP
  if (authContext?.userId) {
    return `rl:user:${authContext.userId}`;
  }
  if (authContext?.tenantId) {
    return `rl:tenant:${authContext.tenantId}`;
  }
  // Usar ipKeyGenerator helper para soportar IPv6 correctamente
  // REQUERIDO por express-rate-limit para evitar bypass de límites IPv6
  // ipKeyGenerator espera un string (IP), no el Request completo
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  return `rl:ip:${ipKeyGenerator(ip)}`;
}

/**
 * Crear rate limiter por usuario
 */
export function createUserRateLimiter(config: UserRateLimitConfig = {}) {
  const defaultTier = config.defaultTier ?? 'free';
  const tiers = {
    free: config.free ?? { requests: 100, window: '1h' },
    pro: config.pro ?? { requests: 1000, window: '1h' },
    enterprise: config.enterprise ?? { requests: 10000, window: '1h' }
  };

  // Configurar Redis store si está disponible
  let redisStore: RedisStore | undefined = undefined;

  try {
    const redisClient = getRedisClient();
    if (redisClient && isRedisAvailable()) {
      redisStore = new RedisStore({
        prefix: 'rl:user:',
        sendCommand: (...args: string[]) => {
          // ioredis call() acepta: command: string, ...args: (string | number | Buffer)[]
          const [command, ...commandArgs] = args;
          if (!command) {
            return Promise.reject(new Error('Redis command is required'));
          }
          const result = redisClient!.call(command, ...commandArgs);
          return result as Promise<boolean | number | string | Array<boolean | number | string>>;
        }
      });
      logger.info('[UserRateLimiter] Usando Redis store para rate limiting por usuario');
    } else {
      logger.warn('[UserRateLimiter] Redis no disponible, usando memory store (no distribuido)');
    }
  } catch (error) {
    logger.warn('[UserRateLimiter] Error inicializando Redis store, usando memory store', {
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return rateLimit({
    ...(redisStore ? { store: redisStore } : {}),
    windowMs: parseWindow(tiers[defaultTier].window),
    max: tiers[defaultTier].requests,
    keyGenerator: config.keyGenerator ?? generateUserKey,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests',
      retryAfter: tiers[defaultTier].window
    },
    // Nota: express-rate-limit no permite cambiar max/windowMs dinámicamente
    // Para rate limiting por tier, se necesitaría crear múltiples instancias
    // Por ahora, usar configuración del tier por defecto
    handler: (req: Request, res: Response) => {
      const reqWithId = req as RequestWithId;
      const tier = getUserTier(req);
      const tierConfig = tiers[tier];

      logger.warn('[UserRateLimiter] Rate limit excedido', {
        userId: (req as Request & { authContext?: AuthContext }).authContext?.userId,
        tier,
        path: req.path,
        requestId: reqWithId.id
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        tier,
        limit: tierConfig.requests,
        window: tierConfig.window,
        retryAfter: tierConfig.window
      });
    }
  });
}

/**
 * Rate limiter por usuario (instancia preconfigurada)
 */
export const userRateLimiter = createUserRateLimiter({
  free: { requests: 100, window: '1h' },
  pro: { requests: 1000, window: '1h' },
  enterprise: { requests: 10000, window: '1h' },
  defaultTier: 'free'
});

