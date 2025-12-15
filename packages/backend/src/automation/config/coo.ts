import { AutomationAgent } from '../types';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'coo-atrasos-excepciones',
        neuraKey: 'coo',
        neuraId: 'a-coo-01',
        name: 'Atrasos y Excepciones',
        description: 'Monitoreo de pedidos atrasados',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_COO_ATRASOS_EXCEPCIONES'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'coo-centro-nps-csat',
        neuraKey: 'coo',
        neuraId: 'a-coo-01',
        name: 'Centro NPS/CSAT',
        description: 'Análisis de satisfacción del cliente',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_COO_CENTRO_NPS_CSAT'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'coo-latido-sla',
        neuraKey: 'coo',
        neuraId: 'a-coo-01',
        name: 'Latido de SLA',
        description: 'Monitoreo en tiempo real de SLAs',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_COO_LATIDO_SLA'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'coo-torre-control',
        neuraKey: 'coo',
        neuraId: 'a-coo-01',
        name: 'Torre de Control',
        description: 'Dashboard operativo centralizado',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_COO_TORRE_CONTROL'],
        trigger: 'manual',
        active: true
    }
];
