/**
 * ECONEURA - Redis Client
 * Cliente Redis para rate limiting distribuido y caching
 */
import Redis from 'ioredis';
import { getValidatedEnv } from '../../config/env';
import { logger } from '../../shared/logger';

let redisClient: Redis | null = null;
let isInitialized = false;

/**
 * Inicializar cliente Redis
 * Uses getValidatedEnv for type safety (safe now that index.ts ensures dotenv load)
 */
export function initializeRedis(): boolean {
  // Allow retry if previously failed due to missing REDIS_URL
  if (isInitialized && redisClient !== null) {
    return true;
  }

  try {
    // Read from validated env
    const env = getValidatedEnv();
    const redisUrl = env.REDIS_URL;

    if (!redisUrl || typeof redisUrl !== 'string' || redisUrl.length < 10) {
      logger.warn('[Redis] REDIS_URL no configurado o muy corto', {
        type: typeof redisUrl,
        length: redisUrl ? redisUrl.length : 0,
        value: redisUrl ? (redisUrl.substring(0, 5) + '...') : 'undefined'
      });
      isInitialized = true;
      return false;
    }

    logger.info('[Redis] Intentando conectar', {
      urlLength: redisUrl.length,
      urlPreview: redisUrl.substring(0, 8) + '...'
    });


    // Double check to be absolutely sure - prevent CRITICAL crash
    if (!redisUrl ||
      redisUrl.trim() === '' ||
      redisUrl.toLowerCase() === 'undefined' ||
      redisUrl.toLowerCase() === 'null') {
      logger.warn('[Redis] REDIS_URL inválido detectado en la inicialización', { value: redisUrl });
      isInitialized = true;
      return false;
    }

    // Mark as trying to initialize
    isInitialized = true;

    // Crear cliente Redis
    try {
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 10) {
            logger.error('[Redis] Máximo de reintentos alcanzado');
            return null; // Detener reintentos
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        keepAlive: 30000,
        lazyConnect: true,
        enableOfflineQueue: false,
        tls: redisUrl.startsWith('rediss://') ? {} : undefined
      });
    } catch (msg) {
      logger.error('🔥 [Redis] CRITICAL ERROR: Fallo síncrono al inicializar ioredis. Fallback a memoria.', {
        error: msg instanceof Error ? msg.message : String(msg),
        maskedUrl: redisUrl ? (redisUrl.substring(0, 10) + '...') : 'null'
      });
      redisClient = null;
      return false;
    }

    // Event handlers
    redisClient.on('connect', () => {
      logger.info('[Redis] Conectado correctamente');
    });

    redisClient.on('ready', () => {
      logger.info('[Redis] Cliente listo');
    });

    redisClient.on('error', (error) => {
      logger.error('[Redis] Error de conexión', { error: error.message });
    });

    redisClient.on('close', () => {
      logger.warn('[Redis] Conexión cerrada');
    });

    // Conectar
    redisClient.connect().catch((error) => {
      logger.error('[Redis] Error conectando', { error: error.message });
      redisClient = null;
    });

    return true;
  } catch (error) {
    logger.error('[Redis] Error inicializando cliente', {
      error: error instanceof Error ? error.message : String(error)
    });
    isInitialized = true;
    return false;
  }
}

/**
 * Obtener cliente Redis
 */
export function getRedisClient(): Redis | null {
  if (!isInitialized) {
    initializeRedis();
  }
  return redisClient;
}

/**
 * Verificar si Redis está disponible
 */
export function isRedisAvailable(): boolean {
  const client = getRedisClient();
  return client !== null && client.status === 'ready';
}

/**
 * Cerrar conexión Redis
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('[Redis] Conexión cerrada');
  }
}

// NOTE: No auto-initialize here - let getRedisClient() do lazy init after dotenv loads

