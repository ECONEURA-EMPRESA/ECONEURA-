/**
 * ECONEURA - Webhook Rate Limiter
 * 
 * Rate limiting específico para webhooks de CRM.
 * Protege contra DoS attacks y saturación de PostgreSQL.
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, isRedisAvailable } from '../../../infra/cache/redisClient';
import { logger } from '../../../shared/logger';

let webhookRedisStore: RedisStore | undefined = undefined;

// Intentar usar Redis store si está disponible
try {
  const redis = getRedisClient();
  if (redis && isRedisAvailable()) {
    webhookRedisStore = new RedisStore({
      prefix: 'rl:webhook:',
      sendCommand: (...args: string[]) => {
        // ioredis call() acepta: command: string, ...args: (string | number | Buffer)[]
        const [command, ...commandArgs] = args;
        if (!command) {
          return Promise.reject(new Error('Redis command is required'));
        }
        const result = redis!.call(command, ...commandArgs);
        return result as Promise<boolean | number | string | Array<boolean | number | string>>;
      }
    });
    logger.info('[WebhookRateLimit] Usando Redis store para rate limiting distribuido');
  } else {
    logger.warn('[WebhookRateLimit] Redis no disponible, usando memory store (no distribuido)');
  }
} catch (error) {
  logger.warn('[WebhookRateLimit] Error inicializando Redis store, usando memory store', {
    error: error instanceof Error ? error.message : String(error)
  });
}

/**
 * Rate limiter para webhooks de CRM
 * 
 * Límites:
 * - 100 requests por minuto por IP
 * - Mensaje claro cuando se excede
 */
export const webhookRateLimiter = rateLimit({
  ...(webhookRedisStore ? { store: webhookRedisStore } : {}),
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // Máximo 100 webhooks por minuto por IP
  message: {
    success: false,
    error: 'Too many webhook requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true, // Retorna `RateLimit-*` headers
  legacyHeaders: false, // No retorna `X-RateLimit-*` headers
  skip: (req) => {
    // Saltar rate limiting en desarrollo local
    return process.env['NODE_ENV'] === 'development' && req.ip === '::1';
  },
  handler: (req, res) => {
    logger.warn('[WebhookRateLimit] Rate limit excedido', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      success: false,
      error: 'Too many webhook requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

