import { AutomationAgent } from '../types';

export const automationAgents: AutomationAgent[] = [
    {
        id: 'ciso-vulnerabilidades',
        neuraKey: 'ciso',
        neuraId: 'a-ciso-01',
        name: 'Vulnerabilidades',
        description: 'Escaneo y gestión de vulnerabilidades',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CISO_VULNERABILIDADES'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'ciso-phishing-triage',
        neuraKey: 'ciso',
        neuraId: 'a-ciso-01',
        name: 'Phishing Triage',
        description: 'Análisis y triage de reportes de phishing',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CISO_PHISHING_TRIAGE'],
        trigger: 'auto',
        active: true
    },
    {
        id: 'ciso-backup-restore-dr',
        neuraKey: 'ciso',
        neuraId: 'a-ciso-01',
        name: 'Backup/Restore DR',
        description: 'Gestión de backups y disaster recovery',
        provider: 'make',
        webhookUrl: process.env['WEBHOOK_CISO_BACKUP_RESTORE_DR'],
        trigger: 'manual',
        active: true
    },
    {
        id: 'ciso-recertificacion',
        neuraKey: 'ciso',
        neuraId: 'a-ciso-01',
        name: 'Recertificación',
        description: 'Recertificación de accesos',
        provider: 'n8n',
        webhookUrl: process.env['WEBHOOK_CISO_RECERTIFICACION'],
        trigger: 'manual',
        active: true
    }
];
