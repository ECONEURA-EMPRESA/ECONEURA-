/**
 * ECONEURA - Secrets Cache
 * Caché con TTL para secretos
 */
import { logger } from '../../shared/logger';

interface CachedSecret {
  value: string;
  timestamp: number;
  ttl: number;
}

export class SecretsCache {
  private readonly cache = new Map<string, CachedSecret>();
  private readonly defaultTTL: number;
  private hits = 0;
  private misses = 0;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * Obtener secret del caché (si no ha expirado)
   */
  get(secretName: string): string | null {
    const cached = this.cache.get(secretName);

    if (!cached) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age >= cached.ttl) {
      // Expiró, eliminar del caché
      this.cache.delete(secretName);
      this.misses++;
      logger.debug('[SecretsCache] Secret expirado', { secretName, age, ttl: cached.ttl });
      return null;
    }

    this.hits++;
    return cached.value;
  }

  /**
   * Guardar secret en caché
   */
  set(secretName: string, value: string, ttl?: number): void {
    const cacheTTL = ttl ?? this.defaultTTL;
    this.cache.set(secretName, {
      value,
      timestamp: Date.now(),
      ttl: cacheTTL
    });
  }

  /**
   * Invalidar un secret específico
   */
  invalidate(secretName: string): void {
    this.cache.delete(secretName);
  }

  /**
   * Limpiar toda la caché
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }
}

