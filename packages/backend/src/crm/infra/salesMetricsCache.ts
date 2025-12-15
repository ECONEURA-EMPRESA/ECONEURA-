/**
 * ECONEURA - CRM Sales Metrics Cache
 * 
 * Caché Redis para métricas de ventas.
 * Evita saturar PostgreSQL con auto-refresh cada 30s.
 * 
 * TTL: 60 segundos (más que auto-refresh de 30s del frontend)
 */

import { getRedisClient, isRedisAvailable } from '../../infra/cache/redisClient';
import { logger } from '../../shared/logger';

const CACHE_TTL = 60; // 60 segundos
const CACHE_PREFIX = 'crm:sales-metrics:';

/**
 * Obtener métricas desde caché o ejecutar función
 */
export async function getCachedSalesMetrics<T>(
  department: 'cmo' | 'cso',
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const fullCacheKey = `${CACHE_PREFIX}${department}:${cacheKey}`;

  // Intentar obtener de caché
  if (isRedisAvailable()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(fullCacheKey);
        if (cached) {
          logger.debug('[CRM Cache] Métricas obtenidas de caché', {
            department,
            cacheKey: fullCacheKey
          });
          return JSON.parse(cached) as T;
        }
      } catch (error) {
        logger.warn('[CRM Cache] Error obteniendo de caché', {
          error: error instanceof Error ? error.message : String(error),
          cacheKey: fullCacheKey
        });
      }
    }
  }

  // Si no hay caché, obtener de DB
  logger.debug('[CRM Cache] Obteniendo métricas de DB', { department, cacheKey });
  const metrics = await fetchFn();

  // Guardar en caché
  if (isRedisAvailable()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.setex(fullCacheKey, CACHE_TTL, JSON.stringify(metrics));
        logger.debug('[CRM Cache] Métricas guardadas en caché', {
          department,
          cacheKey: fullCacheKey,
          ttl: CACHE_TTL
        });
      } catch (error) {
        logger.warn('[CRM Cache] Error guardando en caché', {
          error: error instanceof Error ? error.message : String(error),
          cacheKey: fullCacheKey
        });
      }
    }
  }

  return metrics;
}

/**
 * Invalidar caché de métricas
 */
export async function invalidateSalesMetricsCache(
  department?: 'cmo' | 'cso'
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  try {
    if (department) {
      // Invalidar solo un departamento
      const pattern = `${CACHE_PREFIX}${department}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info('[CRM Cache] Caché invalidado', { department, keysCount: keys.length });
      }
    } else {
      // Invalidar todo
      const pattern = `${CACHE_PREFIX}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info('[CRM Cache] Todo el caché invalidado', { keysCount: keys.length });
      }
    }
  } catch (error) {
    logger.error('[CRM Cache] Error invalidando caché', {
      error: error instanceof Error ? error.message : String(error),
      department
    });
  }
}

