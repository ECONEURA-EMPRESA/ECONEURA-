/**
 * ECONEURA - Secrets Audit
 * Auditoría de accesos a secretos
 */
import { logger } from '../../shared/logger';
import type { SecretAccess } from './SecretsManager';

export class SecretsAudit {
  private readonly enabled: boolean;
  private readonly history: SecretAccess[] = [];
  private readonly maxHistorySize: number = 1000;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * Registrar acceso a un secret
   */
  logAccess(access: SecretAccess & { duration?: number; source?: 'keyvault' | 'env' | 'default' | 'cache' }): void {
    if (!this.enabled) {
      return;
    }

    // Agregar al historial
    const historyEntry: SecretAccess = {
      secretName: access.secretName,
      timestamp: access.timestamp,
      source: access.source ?? 'env',
      ...(access.userId ? { userId: access.userId } : {}),
      ...(access.tenantId ? { tenantId: access.tenantId } : {})
    };
    this.history.push(historyEntry);

    // Limitar tamaño del historial
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Log estructurado
    logger.info('[SecretsAudit] Acceso a secret', {
      secretName: access.secretName,
      source: access.source,
      duration: access.duration,
      userId: access.userId,
      tenantId: access.tenantId
    });
  }

  /**
   * Obtener historial de accesos
   */
  getHistory(limit: number = 100): SecretAccess[] {
    return this.history.slice(-limit).reverse(); // Más recientes primero
  }

  /**
   * Obtener estadísticas
   */
  getStats(): { enabled: boolean; events: number } {
    return {
      enabled: this.enabled,
      events: this.history.length
    };
  }

  /**
   * Limpiar historial
   */
  clear(): void {
    this.history.length = 0;
  }
}

