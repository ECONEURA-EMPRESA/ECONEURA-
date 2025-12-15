/**
 * ECONEURA - Enterprise Rate Limiting
 * Rate limiting con express-rate-limit + Redis para distribución
 * Migrado desde ECONEURA-REMOTE/backend/middleware/rateLimiter.js
 */
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, isRedisAvailable } from '../../../infra/cache/redisClient';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from './requestId';

// Crear store Redis si está disponible, sino usar memory store
let redisStore: RedisStore | undefined = undefined;

try {
  const redisClient = getRedisClient();
  if (redisClient && isRedisAvailable()) {
    redisStore = new RedisStore({
      prefix: 'rl:',
      sendCommand: (...args: string[]) => {
        // ioredis call() acepta: command: string, ...args: (string | number | Buffer)[]
        const [command, ...commandArgs] = args;
        if (!command) {
          return Promise.reject(new Error('Redis command is required'));
        }
        const result = redisClient!.call(command, ...commandArgs);
        // RedisReply puede ser boolean | number | string | (boolean | number | string)[]
        return result as Promise<boolean | number | string | Array<boolean | number | string>>;
      }
    });
    logger.info('[RateLimit] Usando Redis store para rate limiting distribuido');
  } else {
    logger.warn('[RateLimit] Redis no disponible, usando memory store (no distribuido)');
  }
} catch (error) {
  logger.warn('[RateLimit] Error inicializando Redis store, usando memory store', {
    error: error instanceof Error ? error.message : String(error)
  });
}

// Rate limiter global - 1000 requests per 15 minutes (enterprise tier)
export const globalLimiter = rateLimit({
  ...(redisStore ? { store: redisStore } : {}), // Redis store si está disponible, sino memory store
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for enterprise usage
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('[RateLimit] Global rate limit exceeded', {
      ip: req.ip ?? 'unknown',
      path: req.path,
       
      user: (req as RequestWithId).authContext?.userId ?? 'unknown'
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Rate limiter para chat - 100 requests per minute (enterprise tier)
export const chatLimiter = rateLimit({
  ...(redisStore ? { store: redisStore } : {}), // Redis store si está disponible
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Too many chat requests, please try again later.',
    code: 'CHAT_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('[RateLimit] Chat rate limit exceeded', {
      ip: req.ip ?? 'unknown',
       
      user: (req as RequestWithId).authContext?.userId ?? 'unknown'
    });
    res.status(429).json({
      error: 'Too many chat requests, please try again later.',
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute'
    });
  }
});

// Rate limiter para auth - 10 requests per minute (protección brute force)
export const authLimiter = rateLimit({
  ...(redisStore ? { store: redisStore } : {}), // Redis store si está disponible
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('[RateLimit] Auth rate limit exceeded - possible brute force', {
      ip: req.ip ?? 'unknown',
      path: req.path
    });
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute'
    });
  }
});

// Rate limiter para library upload - 20 uploads per hour por usuario
export const libraryUploadLimiter = rateLimit({
  ...(redisStore ? { store: redisStore } : {}), // Redis store si está disponible
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    error: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por usuario autenticado
     
    const userId = (req as RequestWithId).authContext?.userId;
    if (userId) {
      return `user:${userId}`;
    }
    // Usar ipKeyGenerator helper para soportar IPv6 correctamente
    // REQUERIDO por express-rate-limit para evitar bypass de límites IPv6
    // ipKeyGenerator espera un string (IP), no el Request completo
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    return `ip:${ipKeyGenerator(ip)}`;
  },
  skip: (req) => {
    // Skip rate limit si no hay usuario (ya está bloqueado por auth)
    return !(req as RequestWithId).authContext?.userId;
  },
  handler: (req, res) => {
    logger.warn('[RateLimit] Upload rate limit exceeded', {
      ip: req.ip ?? 'unknown',
       
      user: (req as RequestWithId).authContext?.userId ?? 'unknown'
    });
    res.status(429).json({
      error: 'Too many file uploads, please try again later.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour'
    });
  }
});

