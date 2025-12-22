import { ok, err, type Result } from '../../../shared/Result';
import { automationService } from '../services/AutomationService';
import { agentRepository } from '../../infra/persistence/InMemoryAgentRepository';

export interface NeuraAgentExecutionOptions {
    neuraKey: string;
    neuraId: string;
    userId?: string | null | undefined;
    correlationId?: string | undefined;
}

export interface NeuraAgentExecutionResponse {
    success: boolean;
    message: string;
}

export interface DetectedAgentIntent {
    detected: true;
    agentId: string;
    agentName: string;
    provider: string;
}

const EXECUTE_KEYWORDS = ['ejecuta', 'run', 'lanza', 'corre', 'inicia', 'dispara', 'activa'];

/**
 * UseCase: Detect and Execute Automation Agent from Chat Message
 */
export async function executeNeuraAgentFromChat(
    message: string,
    options: NeuraAgentExecutionOptions
): Promise<Result<NeuraAgentExecutionResponse, Error>> {
    const intent = detectAgentIntent(message, options.neuraKey);

    if (!intent) {
        return ok({
            success: false,
            message:
                'No he detectado ningún agente de automatización para ejecutar en este mensaje. ' +
                'Puedes usar frases como "ejecuta Agenda Consejo" o "lanza Tesorería".'
        });
    }

    const executionResult = await automationService.executeByAgentId(intent.agentId, {
        input: { sourceMessage: message },
        userId: options.userId,
        correlationId: options.correlationId,
        authContext: options.userId
            ? {
                userId: options.userId,
                tenantId: 'unknown-tenant',
                roles: [],
                sessionId: 'agent-session'
            }
            : undefined
    });

    if (!executionResult.success) {
        return err(executionResult.error);
    }

    const formattedMessage = formatAgentExecutionResponse(
        intent.agentName,
        executionResult.data.mode,
        executionResult.data.provider,
        executionResult.data.status,
        executionResult.data.data,
        executionResult.data.error
    );

    return ok({
        success: executionResult.data.status === 'completed',
        message: formattedMessage
    });
}

function detectAgentIntent(
    message: string,
    neuraKey: string
): DetectedAgentIntent | null {
    const lowerMessage = message.toLowerCase();

    const hasExecuteIntent = EXECUTE_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
    if (!hasExecuteIntent) {
        return null;
    }

    const agents = agentRepository.findByNeuraKey(neuraKey);
    for (const agent of agents) {
        const agentNameLower = agent.name.toLowerCase();
        if (lowerMessage.includes(agentNameLower)) {
            return {
                detected: true,
                agentId: agent.id,
                agentName: agent.name,
                provider: agent.provider
            };
        }
    }

    return null;
}

function formatAgentExecutionResponse(
    agentName: string,
    mode: 'mock' | 'real',
    provider: string,
    status: 'completed' | 'failed',
    data?: unknown,
    error?: string
): string {
    if (status === 'failed') {
        return `❌ Error ejecutando ${agentName}: ${error ?? 'error desconocido'}`;
    }

    if (mode === 'mock') {
        return (
            `✅ [MODO DEMO] ${agentName} ejecutado.\n\n` +
            `⚠️ Webhook no configurado. Configura la URL del webhook en el panel de administración.\n\n` +
            `Proveedor: ${provider}\n` +
            `Payload simulado:\n${JSON.stringify(data, null, 2)}`
        );
    }

    return (
        `✅ ${agentName} ejecutado exitosamente.\n\n` +
        `Proveedor: ${provider}\n` +
        `Resultado:\n${JSON.stringify(data, null, 2)}`
    );
}
