export type AutomationProvider = 'make' | 'n8n' | 'custom';

export interface AutomationAgent {
    id: string;
    name: string;
    description: string;
    neuraKey: string; // The "Department" identifier
    neuraId: string;    // ID interno del Neura (para búsquedas optimizadas)
    provider: AutomationProvider;
    webhookUrl?: string; // Optional: Some internal agents might run in-process code
    trigger: 'manual' | 'auto' | 'scheduled';
    active: boolean;
    requiredRoles?: string[];
}

export interface AgentExecutionInput {
    sourceMessage: string;
    parameters?: Record<string, any>;
}

export interface AgentExecutionOutput {
    success: boolean;
    data?: any;
    error?: string;
}
