import { ok, err, type Result } from '../shared/Result';
import { logger } from '../shared/logger';
import {
  automationAgents,
  getAutomationAgentById,
  type AutomationAgent
} from './automationAgentsRegistry';
import { makeAdapter } from '../infra/automation/MakeAdapter';
import { n8nAdapter } from '../infra/automation/N8NAdapter';
import { recordAuditEvent } from '../audit/infra/loggerAuditSink';
import type { AuthContext } from '../shared/types/auth';

export interface AutomationExecutionPayload {
  input: Record<string, unknown>;
  userId?: string | null | undefined;
  correlationId?: string | undefined;
  authContext?: AuthContext | undefined;
}

export interface AutomationExecutionResult {
  agentId: string;
  neuraKey: string;
  neuraId: string;
  mode: 'mock' | 'real';
  provider: string;
  status: 'completed' | 'failed';
  durationMs?: number;
  data?: unknown;
  error?: string;
}

export interface AutomationServicePort {
  executeByAgentId(
    agentId: string,
    payload: AutomationExecutionPayload
  ): Promise<Result<AutomationExecutionResult, Error>>;

  listAgentsByNeuraKey(neuraKey: string): AutomationAgent[];
}

export class AutomationService implements AutomationServicePort {
  listAgentsByNeuraKey(neuraKey: string): AutomationAgent[] {
    return automationAgents.filter((a) => a.neuraKey === neuraKey && a.active);
  }

  async executeByAgentId(
    agentId: string,
    payload: AutomationExecutionPayload
  ): Promise<Result<AutomationExecutionResult, Error>> {
    const agentResult = getAutomationAgentById(agentId);

    if (!agentResult.success) {
      return err(new Error(`Agent not found: ${agentId}`));
    }

    const agent = agentResult.data;

    logger.info('[AutomationService] Ejecutando agente', {
      agentId,
      neuraKey: agent.neuraKey,
      provider: agent.provider
    });

    // Si no hay webhook configurado → modo mock
    if (!agent.webhookUrl) {
      logger.warn('[AutomationService] Webhook no configurado, modo mock', { agentId });

      const mockResult: AutomationExecutionResult = {
        agentId: agent.id,
        neuraKey: agent.neuraKey,
        neuraId: agent.neuraId,
        mode: 'mock',
        provider: agent.provider,
        status: 'completed',
        data: {
          executionId: `mock-${Date.now()}`,
          platform: agent.provider,
          input: payload.input
        }
      };

      await recordAuditEvent({
        action: 'automation.execute',
        actor: payload.authContext
          ? {
            userId: payload.authContext.userId,
            tenantId: payload.authContext.tenantId,
            roles: payload.authContext.roles
          }
          : null,
        target: {
          type: 'automation-agent',
          id: agent.id
        },
        metadata: {
          mode: 'mock',
          provider: agent.provider
        }
      });

      return ok(mockResult);
    }

    const start = Date.now();

    try {
      if (agent.provider === 'make') {
        const result = await makeAdapter.executeWebhook({
          webhookUrl: agent.webhookUrl,
          data: {
            agentId: agent.id,
            input: payload.input,
            userId: payload.userId,
            correlationId: payload.correlationId,
            source: 'econeura-neura-chat'
          }
        });

        if (!result.success) {
          const errorResult = this.handleError(agent, start, result.error);
          await recordAuditEvent({
            action: 'automation.execute',
            actor: payload.authContext
              ? {
                userId: payload.authContext.userId,
                tenantId: payload.authContext.tenantId,
                roles: payload.authContext.roles
              }
              : null,
            target: {
              type: 'automation-agent',
              id: agent.id
            },
            metadata: {
              mode: 'real',
              provider: agent.provider,
              success: false,
              error: result.error.message
            }
          });
          return errorResult;
        }

        const successResult: AutomationExecutionResult = {
          agentId: agent.id,
          neuraKey: agent.neuraKey,
          neuraId: agent.neuraId,
          mode: 'real',
          provider: agent.provider,
          status: 'completed',
          durationMs: Date.now() - start,
          data: result.data.data
        };

        await recordAuditEvent({
          action: 'automation.execute',
          actor: payload.authContext
            ? {
              userId: payload.authContext.userId,
              tenantId: payload.authContext.tenantId,
              roles: payload.authContext.roles
            }
            : null,
          target: {
            type: 'automation-agent',
            id: agent.id
          },
          metadata: {
            mode: 'real',
            provider: agent.provider,
            success: true
          }
        });

        return ok(successResult);
      }

      if (agent.provider === 'n8n') {
        const result = await n8nAdapter.executeWebhook({
          webhookUrl: agent.webhookUrl,
          data: {
            agentId: agent.id,
            input: payload.input,
            userId: payload.userId,
            correlationId: payload.correlationId,
            source: 'econeura-neura-chat'
          }
        });

        if (!result.success) {
          const errorResult = this.handleError(agent, start, result.error);
          await recordAuditEvent({
            action: 'automation.execute',
            actor: payload.authContext
              ? {
                userId: payload.authContext.userId,
                tenantId: payload.authContext.tenantId,
                roles: payload.authContext.roles
              }
              : null,
            target: {
              type: 'automation-agent',
              id: agent.id
            },
            metadata: {
              mode: 'real',
              provider: agent.provider,
              success: false,
              error: result.error.message
            }
          });
          return errorResult;
        }

        const successResult: AutomationExecutionResult = {
          agentId: agent.id,
          neuraKey: agent.neuraKey,
          neuraId: agent.neuraId,
          mode: 'real',
          provider: agent.provider,
          status: 'completed',
          durationMs: Date.now() - start,
          data: result.data.data
        };

        await recordAuditEvent({
          action: 'automation.execute',
          actor: payload.authContext
            ? {
              userId: payload.authContext.userId,
              tenantId: payload.authContext.tenantId,
              roles: payload.authContext.roles
            }
            : null,
          target: {
            type: 'automation-agent',
            id: agent.id
          },
          metadata: {
            mode: 'real',
            provider: agent.provider,
            success: true
          }
        });

        return ok(successResult);
      }

      const unsupportedError = new Error(`Provider not supported: ${agent.provider}`);
      return this.handleError(agent, start, unsupportedError);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      return this.handleError(agent, start, error);
    }
  }

  private handleError(
    agent: AutomationAgent,
    start: number,
    error: Error
  ): Result<AutomationExecutionResult, Error> {
    const duration = Date.now() - start;

    logger.error('[AutomationService] Error ejecutando agente', {
      agentId: agent.id,
      neuraKey: agent.neuraKey,
      provider: agent.provider,
      duration,
      error: error.message
    });

    return err(error);
  }
}

export const automationService = new AutomationService();
