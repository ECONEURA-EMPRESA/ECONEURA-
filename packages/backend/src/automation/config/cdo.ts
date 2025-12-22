import { AutomationAgent } from '../domain/entities/AutomationAgent';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'cdo-linaje',
        neuraKey: 'cdo',
        neuraId: 'a-cdo-01',
        name: 'Linaje',
        description: 'Tracking de linaje de datos',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CDO_LINAJE'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cdo-calidad-datos',
        neuraKey: 'cdo',
        neuraId: 'a-cdo-01',
        name: 'Calidad de Datos',
        description: 'Monitoreo de calidad de datos',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CDO_CALIDAD_DATOS'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cdo-catalogo',
        neuraKey: 'cdo',
        neuraId: 'a-cdo-01',
        name: 'Catálogo',
        description: 'Gestión de catálogo de datos',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CDO_CATALOGO'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'cdo-coste-dwh',
        neuraKey: 'cdo',
        neuraId: 'a-cdo-01',
        name: 'Coste DWH',
        description: 'Optimización de costos de data warehouse',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CDO_COSTE_DWH'],
        trigger: 'auto',
        active: true
    }
];
