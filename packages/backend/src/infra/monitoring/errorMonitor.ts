/**
 * Mejora 7: Monitoring Automático de Errores
 * Detecta patrones de errores y alerta automáticamente
 */
import { logger } from '../../shared/logger';
import { getRedisClient, isRedisAvailable } from '../cache/redisClient';

interface ErrorPattern {
  error: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  paths: Set<string>;
}

const ERROR_PATTERNS = new Map<string, ErrorPattern>();
const ALERT_THRESHOLD = 5; // Alertar después de 5 errores del mismo tipo
const PATTERN_TTL = 3600; // 1 hora

/**
 * Registrar error para análisis
 */
export async function recordError(
  error: Error,
  context: {
    path?: string;
    method?: string;
    userId?: string;
    department?: string;
    correlationId?: string;
  }
): Promise<void> {
  const errorKey = error.message.substring(0, 100); // Primeros 100 caracteres
  const now = new Date();

  // Obtener o crear patrón
  let pattern = ERROR_PATTERNS.get(errorKey);
  if (!pattern) {
    pattern = {
      error: errorKey,
      count: 0,
      firstSeen: now,
      lastSeen: now,
      paths: new Set()
    };
    ERROR_PATTERNS.set(errorKey, pattern);
  }

  pattern.count++;
  pattern.lastSeen = now;
  if (context.path) {
    pattern.paths.add(context.path);
  }

  // Guardar en Redis si está disponible (para persistencia entre reinicios)
  if (isRedisAvailable()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const redisKey = `error:pattern:${Buffer.from(errorKey).toString('base64').substring(0, 50)}`;
        await redis.setex(redisKey, PATTERN_TTL, JSON.stringify({
          count: pattern.count,
          firstSeen: pattern.firstSeen.toISOString(),
          lastSeen: pattern.lastSeen.toISOString(),
          paths: Array.from(pattern.paths)
        }));
      } catch (error) {
        logger.warn('[ErrorMonitor] Error guardando en Redis', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  // Alertar si supera el umbral
  if (pattern.count >= ALERT_THRESHOLD && pattern.count === ALERT_THRESHOLD) {
    logger.error('[ErrorMonitor] ⚠️ ALERTA: Patrón de error detectado', {
      error: errorKey,
      count: pattern.count,
      paths: Array.from(pattern.paths),
      firstSeen: pattern.firstSeen.toISOString(),
      context
    });
  }
}

/**
 * Obtener estadísticas de errores
 */
export function getErrorStats(): {
  totalPatterns: number;
  totalErrors: number;
  topErrors: Array<{ error: string; count: number; paths: string[] }>;
} {
  const patterns = Array.from(ERROR_PATTERNS.values());
  const totalErrors = patterns.reduce((sum, p) => sum + p.count, 0);
  const topErrors = patterns
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(p => ({
      error: p.error,
      count: p.count,
      paths: Array.from(p.paths)
    }));

  return {
    totalPatterns: patterns.length,
    totalErrors,
    topErrors
  }
}

/**
 * Limpiar patrones antiguos
 */
export function cleanupOldPatterns(): void {
  const oneHourAgo = Date.now() - PATTERN_TTL * 1000;
  for (const [key, pattern] of ERROR_PATTERNS.entries()) {
    if (pattern.lastSeen.getTime() < oneHourAgo) {
      ERROR_PATTERNS.delete(key);
    }
  }
}

// Limpiar cada 30 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldPatterns, 30 * 60 * 1000);
}


