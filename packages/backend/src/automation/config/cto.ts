import { AutomationAgent } from '../domain/entities/AutomationAgent';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'cto-finops-cloud',
        neuraKey: 'cto',
        neuraId: 'a-cto-01',
        name: 'FinOps Cloud',
        description: 'Optimización de costos cloud',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CTO_FINOPS_CLOUD'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cto-seguridad-cicd',
        neuraKey: 'cto',
        neuraId: 'a-cto-01',
        name: 'Seguridad CI/CD',
        description: 'Seguridad en pipelines CI/CD',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CTO_SEGURIDAD_CICD'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cto-observabilidad-slo',
        neuraKey: 'cto',
        neuraId: 'a-cto-01',
        name: 'Observabilidad SLO',
        description: 'Monitoreo de SLOs y SLAs',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CTO_OBSERVABILIDAD_SLO'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cto-gestion-incidencias',
        neuraKey: 'cto',
        neuraId: 'a-cto-01',
        name: 'Gestión Incidencias',
        description: 'Gestión de incidentes técnicos',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CTO_GESTION_INCIDENCIAS'],
        trigger: 'manual',
        active: true
    }
];
