/**
 * Mejora 5: Cache Automático para Respuestas del LLM
 * Evita llamadas duplicadas al LLM con el mismo input
 * Usa Redis si está disponible, sino memory cache
 */
import { getRedisClient, isRedisAvailable } from './redisClient';
import { logger } from '../../shared/logger';
import { createHash } from 'crypto';

const CACHE_TTL = 3600; // 1 hora (respuestas del LLM son estables)
const CACHE_PREFIX = 'llm:response:';
const MEMORY_CACHE = new Map<string, { response: string; expiresAt: number }>();

/**
 * Generar clave de cache basada en input y configuración
 */
function generateCacheKey(
  agentId: string,
  userInput: string,
  systemPrompt?: string
): string {
  const content = `${agentId}:${userInput}:${systemPrompt || ''}`;
  const hash = createHash('sha256').update(content).digest('hex');
  return `${CACHE_PREFIX}${hash}`;
}

/**
 * Obtener respuesta del LLM desde cache
 */
export async function getCachedLLMResponse(
  agentId: string,
  userInput: string,
  systemPrompt?: string
): Promise<string | null> {
  const cacheKey = generateCacheKey(agentId, userInput, systemPrompt);

  // Intentar Redis primero
  if (isRedisAvailable()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('[LLM Cache] Respuesta obtenida de Redis', { agentId, cacheKey });
          return cached;
        }
      } catch (error) {
        logger.warn('[LLM Cache] Error obteniendo de Redis', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  // Fallback a memory cache
  const memoryCached = MEMORY_CACHE.get(cacheKey);
  if (memoryCached && memoryCached.expiresAt > Date.now()) {
    logger.debug('[LLM Cache] Respuesta obtenida de memory cache', { agentId, cacheKey });
    return memoryCached.response;
  } else if (memoryCached) {
    // Expiró, eliminar
    MEMORY_CACHE.delete(cacheKey);
  }

  return null;
}

/**
 * Guardar respuesta del LLM en cache
 */
export async function setCachedLLMResponse(
  agentId: string,
  userInput: string,
  response: string,
  systemPrompt?: string,
  ttl: number = CACHE_TTL
): Promise<void> {
  const cacheKey = generateCacheKey(agentId, userInput, systemPrompt);

  // Guardar en Redis si está disponible
  if (isRedisAvailable()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.setex(cacheKey, ttl, response);
        logger.debug('[LLM Cache] Respuesta guardada en Redis', { agentId, cacheKey, ttl });
        return;
      } catch (error) {
        logger.warn('[LLM Cache] Error guardando en Redis', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  // Fallback a memory cache
  MEMORY_CACHE.set(cacheKey, {
    response,
    expiresAt: Date.now() + ttl * 1000
  });
  logger.debug('[LLM Cache] Respuesta guardada en memory cache', { agentId, cacheKey, ttl });
}

/**
 * Limpiar cache (útil para testing o invalidación manual)
 */
export async function clearLLMCache(): Promise<void> {
  MEMORY_CACHE.clear();
  
  if (isRedisAvailable()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const keys = await redis.keys(`${CACHE_PREFIX}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        logger.info('[LLM Cache] Cache limpiado', { keysDeleted: keys.length });
      } catch (error) {
        logger.warn('[LLM Cache] Error limpiando cache', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
}


