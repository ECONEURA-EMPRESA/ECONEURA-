import { AutomationAgent } from '../types';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'ia-salud-failover',
        neuraKey: 'ia',
        neuraId: 'a-ia-01',
        name: 'Salud y Failover',
        description: 'Monitoreo de salud y failover de modelos IA',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_IA_SALUD_FAILOVER'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'ia-cost-tracker',
        neuraKey: 'ia',
        neuraId: 'a-ia-01',
        name: 'Cost Tracker',
        description: 'Tracking de costos de APIs de IA',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_IA_COST_TRACKER'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'ia-revision-prompts',
        neuraKey: 'ia',
        neuraId: 'a-ia-01',
        name: 'Revisión Prompts',
        description: 'Análisis y optimización de prompts',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_IA_REVISION_PROMPTS'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'ia-vigilancia-cuotas',
        neuraKey: 'ia',
        neuraId: 'a-ia-01',
        name: 'Vigilancia Cuotas',
        description: 'Monitoreo de cuotas de API',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_IA_VIGILANCIA_CUOTAS'],
        trigger: 'auto',
        active: true
    }
];
