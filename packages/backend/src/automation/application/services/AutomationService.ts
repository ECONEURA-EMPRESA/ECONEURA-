import { ok, err, type Result } from '../../../shared/Result';
import { logger } from '../../../shared/logger';
import type { AutomationAgent } from '../../domain/entities/AutomationAgent';
import { agentRepository } from '../../infra/persistence/InMemoryAgentRepository'; // Normalmente inyectado, aquí directo por simpleza temporal
import { makeAdapter } from '../../../infra/automation/MakeAdapter';
import { n8nAdapter } from '../../../infra/automation/N8NAdapter';
import { recordAuditEvent } from '../../../audit/infra/loggerAuditSink';
import type { AuthContext } from '../../../shared/types/auth';

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

export class AutomationService {

    listAgentsByNeuraKey(neuraKey: string): AutomationAgent[] {
        return agentRepository.findByNeuraKey(neuraKey);
    }

    async executeByAgentId(
        agentId: string,
        payload: AutomationExecutionPayload
    ): Promise<Result<AutomationExecutionResult, Error>> {
        const agentResult = agentRepository.findById(agentId);

        if (!agentResult.success) {
            return err(new Error(`Agent not found: ${agentId}`));
        }

        const agent = agentResult.data;

        logger.info('[AutomationService] Ejecutando agente', {
            agentId,
            neuraKey: agent.neuraKey,
            provider: agent.provider
        });

        if (!agent.webhookUrl) {
            // Mock Implementation Logic (extracted to keep clean)
            return this.executeMock(agent, payload);
        }

        // Real Execution Logic
        return this.executeReal(agent, payload);
    }

    private async executeMock(agent: AutomationAgent, payload: AutomationExecutionPayload): Promise<Result<AutomationExecutionResult, Error>> {
        logger.warn('[AutomationService] Webhook no configurado, modo mock', { agentId: agent.id });
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
        // Log audit omitted for brevity in this step
        return ok(mockResult);
    }

    private async executeReal(agent: AutomationAgent, payload: AutomationExecutionPayload): Promise<Result<AutomationExecutionResult, Error>> {
        const start = Date.now();
        try {
            // NOTE: Adapters should also be injected ports in pure DDD, but importing for expediency
            let result;
            if (agent.provider === 'make') {
                result = await makeAdapter.executeWebhook({ webhookUrl: agent.webhookUrl!, data: { ...payload, agentId: agent.id } });
            } else if (agent.provider === 'n8n') {
                result = await n8nAdapter.executeWebhook({ webhookUrl: agent.webhookUrl!, data: { ...payload, agentId: agent.id } });
            } else {
                throw new Error(`Provider not supported: ${agent.provider}`);
            }

            if (!result.success) throw result.error;

            return ok({
                agentId: agent.id,
                neuraKey: agent.neuraKey,
                neuraId: agent.neuraId,
                mode: 'real',
                provider: agent.provider,
                status: 'completed',
                durationMs: Date.now() - start,
                data: result.data
            });

        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            logger.error(`[AutomationService] Error executing ${agent.id}`, { error: error.message });
            return err(error);
        }
    }
}

export const automationService = new AutomationService();
