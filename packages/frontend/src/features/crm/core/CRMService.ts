import { Lead, CRMFilters, WebhookEvent } from './types';

/**
 * The Data Layer for CRM.
 * Decouples UI from API implementation details.
 */
class CRMServiceLogic {
    private baseUrl = '/api/crm';

    async getLeads(filters?: CRMFilters): Promise<Lead[]> {
        // In strict mode, this would call fetch()
        // For now, we return mock data that matches the new architecture
        return [
            { id: '1', name: 'TechCorp Solutions', status: 'new', score: 85, source: 'linkedin', createdAt: new Date().toISOString() },
            { id: '2', name: 'Global Ventures', status: 'contacted', score: 92, source: 'web_form', createdAt: new Date().toISOString() },
            { id: '3', name: 'Startup Inc', status: 'qualified', score: 78, source: 'referral', createdAt: new Date().toISOString() },
        ];
    }

    async getWebhooks(): Promise<WebhookEvent[]> {
        return [];
    }

    async getStats(): Promise<any> {
        return {
            totalLeads: 145,
            conversionRate: 12.5,
            activeDeals: 34
        };
    }
}

export const CRMService = new CRMServiceLogic();
