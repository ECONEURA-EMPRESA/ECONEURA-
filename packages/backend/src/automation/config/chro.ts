import { AutomationAgent } from '../types';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'chro-encuesta-pulso',
        neuraKey: 'chro',
        neuraId: 'a-chro-01',
        name: 'Encuesta de Pulso',
        description: 'Encuestas de clima organizacional',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CHRO_ENCUESTA_PULSO'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'chro-offboarding-seguro',
        neuraKey: 'chro',
        neuraId: 'a-chro-01',
        name: 'Offboarding Seguro',
        description: 'Proceso de offboarding automatizado',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CHRO_OFFBOARDING_SEGURO'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'chro-onboarding-orquestado',
        neuraKey: 'chro',
        neuraId: 'a-chro-01',
        name: 'Onboarding Orquestado',
        description: 'Onboarding automatizado de nuevos empleados',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CHRO_ONBOARDING_ORQUESTADO'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'chro-pipeline-contratacion',
        neuraKey: 'chro',
        neuraId: 'a-chro-01',
        name: 'Pipeline Contratación',
        description: 'Gestión de pipeline de reclutamiento',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CHRO_PIPELINE_CONTRATACION'],
        trigger: 'auto',
        active: true
    }
];
