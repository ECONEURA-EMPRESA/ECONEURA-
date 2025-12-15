import { randomUUID } from 'crypto';
import { logger } from '../../shared/logger';
import type { AuditEvent, AuditAction, AuditActor, AuditTarget } from '../domain';

export interface AuditSink {
  record(event: AuditEvent): Promise<void>;
}

/**
 * Implementación inicial de AuditSink que simplemente escribe en el logger estructurado.
 * En el futuro se puede sustituir por un adaptador a App Insights / Log Analytics.
 */
export class LoggerAuditSink implements AuditSink {
  async record(event: AuditEvent): Promise<void> {
    logger.info('[Audit] Event', {
      id: event.id,
      action: event.action,
      actor: event.actor,
      target: event.target,
      metadata: event.metadata,
      timestamp: event.timestamp.toISOString()
    });
  }
}

export const loggerAuditSink = new LoggerAuditSink();

export async function recordAuditEvent(params: {
  action: AuditAction;
  actor: AuditActor | null;
  target: AuditTarget | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const event: AuditEvent = {
    id: randomUUID(),
    timestamp: new Date(),
    action: params.action,
    actor: params.actor,
    target: params.target,
    metadata: params.metadata
  };

  await loggerAuditSink.record(event);
}


