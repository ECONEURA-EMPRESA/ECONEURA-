import { AutomationAgent } from '../types';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'cmo-embudo-comercial',
        neuraKey: 'cmo',
        neuraId: 'a-mkt-01',
        name: 'Embudo Comercial',
        description: 'Análisis del funnel comercial',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CMO_EMBUDO_COMERCIAL'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cmo-salud-pipeline',
        neuraKey: 'cmo',
        neuraId: 'a-mkt-01',
        name: 'Salud de Pipeline',
        description: 'Monitoreo de salud del pipeline de ventas',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CMO_SALUD_PIPELINE'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cmo-calidad-leads',
        neuraKey: 'cmo',
        neuraId: 'a-mkt-01',
        name: 'Calidad de Leads',
        description: 'Análisis de calidad de leads',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CMO_CALIDAD_LEADS'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cmo-post-campana',
        neuraKey: 'cmo',
        neuraId: 'a-mkt-01',
        name: 'Post-Campaña',
        description: 'Análisis post-mortem de campañas',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CMO_POST_CAMPANA'],
        trigger: 'manual',
        active: true
    }
];
