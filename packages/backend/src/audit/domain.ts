export type AuditAction =
  | 'automation.execute'
  | 'llm.invoke'
  | 'identity.login'
  | 'identity.logout'
  | 'identity.role_change';

export interface AuditActor {
  userId: string;
  tenantId: string;
  roles: string[];
}

export interface AuditTarget {
  type: 'automation-agent' | 'neura' | 'conversation' | 'user' | 'system';
  id?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: AuditAction;
  actor: AuditActor | null;
  target: AuditTarget | null;
  metadata?: Record<string, unknown> | undefined;
}


