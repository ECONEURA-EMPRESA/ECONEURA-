import { AutomationAgent } from '../types';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'ceo-agenda-consejo',
        neuraKey: 'ceo',
        neuraId: 'a-ceo-01',
        name: 'Agenda Consejo',
        description: 'Preparación de agenda del consejo ejecutivo',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CEO_AGENDA_CONSEJO'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'ceo-anuncio-semanal',
        neuraKey: 'ceo',
        neuraId: 'a-ceo-01',
        name: 'Anuncio Semanal',
        description: 'Comunicación semanal a toda la empresa',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CEO_ANUNCIO_SEMANAL'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'ceo-resumen-ejecutivo',
        neuraKey: 'ceo',
        neuraId: 'a-ceo-01',
        name: 'Resumen Ejecutivo',
        description: 'Resumen ejecutivo del día',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CEO_RESUMEN_EJECUTIVO'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'ceo-seguimiento-okr',
        neuraKey: 'ceo',
        neuraId: 'a-ceo-01',
        name: 'Seguimiento OKR',
        description: 'Tracking de OKRs trimestrales',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CEO_SEGUIMIENTO_OKR'],
        trigger: 'manual',
        active: true
    }
];
