import { AutomationAgent } from '../types';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'cfo-tesoreria',
        neuraKey: 'cfo',
        neuraId: 'a-cfo-01',
        name: 'Tesorería',
        description: 'Gestión de tesorería y cash flow',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CFO_TESORERIA'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cfo-variance',
        neuraKey: 'cfo',
        neuraId: 'a-cfo-01',
        name: 'Variance',
        description: 'Análisis de variance vs presupuesto',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CFO_VARIANCE'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cfo-facturacion',
        neuraKey: 'cfo',
        neuraId: 'a-cfo-01',
        name: 'Facturación',
        description: 'Automatización de facturación',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CFO_FACTURACION'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cfo-compras',
        neuraKey: 'cfo',
        neuraId: 'a-cfo-01',
        name: 'Compras',
        description: 'Gestión de órdenes de compra',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CFO_COMPRAS'],
        trigger: 'manual',
        active: true
    }
];
