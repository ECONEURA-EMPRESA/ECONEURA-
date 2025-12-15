/**
 * ECONEURA - Secrets Manager Unificado (Google Cloud Native)
 * Gestión centralizada de secretos con estratificación por entorno.
 * 
 * Estrategia de fallback:
 * 1. Variables de entorno (inyectadas por Cloud Run / Secret Manager)
 * 2. Valores por defecto (solo dev)
 * 3. Error explícito (prod)
 */
import { logger } from '../../shared/logger';
import { getValidatedEnv } from '../../config/env';
import { EnvProvider } from './EnvProvider';
import { SecretsCache } from './Cache';
import { SecretsAudit } from './Audit';

export interface SecretsManagerConfig {
  environment: 'development' | 'staging' | 'production';
  enableAudit: boolean;
  cacheTTL?: number; // en milisegundos
}

export interface SecretAccess {
  secretName: string;
  timestamp: number;
  source: 'env' | 'default';
  userId?: string;
  tenantId?: string;
}

export class SecretsManager {
  private readonly envProvider: EnvProvider;
  private readonly cache: SecretsCache;
  private readonly audit: SecretsAudit;
  private readonly config: SecretsManagerConfig;
  private readonly defaults: Map<string, string>;

  constructor(config: SecretsManagerConfig) {
    this.config = config;
    this.envProvider = new EnvProvider();
    this.cache = new SecretsCache(config.cacheTTL ?? 5 * 60 * 1000); // 5 minutos por defecto
    this.audit = new SecretsAudit(config.enableAudit);

    // Valores por defecto (solo para development)
    this.defaults = new Map<string, string>();
    if (config.environment === 'development') {
      this.defaults.set('JWT-SECRET', 'dev-jwt-secret-min-64-chars-change-in-production');
      this.defaults.set('SESSION-SECRET', 'dev-session-secret-min-32-chars');
      this.defaults.set('OPENAI-API-KEY', '');
    }
  }

  /**
   * Obtener secret con estrategia de fallback
   */
  async getSecret(secretName: string, context?: { userId?: string; tenantId?: string }): Promise<string> {
    const startTime = Date.now();

    // Verificar caché primero
    const cached = this.cache.get(secretName);
    if (cached) {
      this.audit.logAccess({
        secretName,
        timestamp: Date.now(),
        source: 'env',
        ...(context ?? {})
      });
      return cached;
    }

    let secret: string | null = null;
    let source: 'env' | 'default' = 'env';

    // 1. Intentar Variables de Entorno (Standard GCP Approach)
    // Cloud Run injects secrets as env vars automatically.
    try {
      secret = this.envProvider.getSecret(secretName);
      source = 'env';
    } catch (error) {
      logger.debug('[SecretsManager] Variable de entorno no encontrada', {
        secretName,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // 2. Intentar valores por defecto (solo development)
    if (!secret && this.config.environment === 'development') {
      secret = this.defaults.get(secretName) ?? null;
      if (secret) {
        source = 'default';
        logger.warn('[SecretsManager] Usando valor por defecto (solo dev)', { secretName });
      }
    }

    // 3. Error explícito si no se encontró
    if (!secret) {
      const error = new Error(`Secret ${secretName} no encontrado en ningún provider`);
      logger.error('[SecretsManager] Secret no encontrado', {
        secretName,
        environment: this.config.environment
      });
      throw error;
    }

    // Guardar en caché
    this.cache.set(secretName, secret);

    // Auditoría
    this.audit.logAccess({
      secretName,
      timestamp: Date.now(),
      source: source,
      duration: Date.now() - startTime,
      ...(context ?? {})
    });

    return secret;
  }

  /**
   * Obtener JWT Secret (método de conveniencia)
   */
  async getJWTSecret(context?: { userId?: string; tenantId?: string }): Promise<string> {
    return this.getSecret('JWT-SECRET', context);
  }

  /**
   * Obtener Session Secret (método de conveniencia)
   */
  async getSessionSecret(context?: { userId?: string; tenantId?: string }): Promise<string> {
    return this.getSecret('SESSION-SECRET', context);
  }

  /**
   * Obtener OpenAI API Key (método de conveniencia)
   */
  async getOpenAIKey(context?: { userId?: string; tenantId?: string }): Promise<string> {
    return this.getSecret('OPENAI-API-KEY', context);
  }

  /**
   * Invalidar caché de un secret (útil para rotación)
   */
  invalidateCache(secretName: string): void {
    this.cache.invalidate(secretName);
    logger.info('[SecretsManager] Caché invalidado', { secretName });
  }

  /**
   * Limpiar toda la caché
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('[SecretsManager] Caché limpiada');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    cache?: { size: number; hits: number; misses: number };
    audit?: { enabled: boolean; events: number };
  }> {
    return {
      status: 'ok',
      cache: this.cache.getStats(),
      audit: this.audit.getStats()
    };
  }

  /**
   * Obtener historial de accesos (últimos N)
   */
  getAccessHistory(limit: number = 100): SecretAccess[] {
    return this.audit.getHistory(limit) as SecretAccess[];
  }
}

// Singleton con configuración basada en entorno
let secretsManagerInstance: SecretsManager | null = null;

export function getSecretsManager(): SecretsManager {
  if (secretsManagerInstance) {
    return secretsManagerInstance;
  }

  const env = getValidatedEnv();
  const nodeEnv = env.NODE_ENV ?? 'development';
  const environment = (nodeEnv === 'production' ? 'production' : nodeEnv === 'test' ? 'development' : 'development') as 'development' | 'staging' | 'production';

  secretsManagerInstance = new SecretsManager({
    environment,
    enableAudit: environment !== 'development', // Solo auditar en staging/prod
    cacheTTL: 5 * 60 * 1000 // 5 minutos
  });

  return secretsManagerInstance;
}
