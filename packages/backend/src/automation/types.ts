export type AutomationProvider = 'make' | 'n8n' | 'llm';

export type AutomationTrigger = 'manual' | 'auto' | 'scheduled';

export interface AutomationAgent {
    id: string;
    neuraKey: string;
    neuraId: string;
    name: string;
    description: string;
    provider: AutomationProvider;
    webhookUrl?: string | undefined;
    trigger: AutomationTrigger;
    active: boolean;
}
