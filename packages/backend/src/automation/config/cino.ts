import { AutomationAgent } from '../domain/entities/AutomationAgent';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'cino-patentes-papers',
        neuraKey: 'cino',
        neuraId: 'a-cino-01',
        name: 'Explorador de Patentes y Papers',
        description: 'Búsqueda y análisis de patentes y papers científicos',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CINO_PATENTES_PAPERS'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'cino-radar-startups',
        neuraKey: 'cino',
        neuraId: 'a-cino-01',
        name: 'Radar de Startups y Ecosistemas',
        description: 'Monitoreo de ecosistema de startups',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CINO_RADAR_STARTUPS'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cino-prototipos-ia',
        neuraKey: 'cino',
        neuraId: 'a-cino-01',
        name: 'Generador de Prototipos IA/No-Code',
        description: 'Generación automática de prototipos',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CINO_PROTOTIPOS_IA'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'cino-tendencias-usuario',
        neuraKey: 'cino',
        neuraId: 'a-cino-01',
        name: 'Agente de Tendencias de Usuario',
        description: 'Análisis de tendencias de comportamiento',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CINO_TENDENCIAS_USUARIO'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'cino-innovation-lab',
        neuraKey: 'cino',
        neuraId: 'a-cino-01',
        name: 'Innovation Lab',
        description: 'Laboratorio de innovación experimental',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CINO_INNOVATION_LAB'],
        trigger: 'manual',
        active: true
    }
];
