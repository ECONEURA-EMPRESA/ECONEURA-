export interface Lead {
    id: string;
    name: string;
    status: 'new' | 'contacted' | 'polluted' | 'qualified' | 'converted';
    score: number;
    source: string;
    createdAt: string;
    payload?: any;
}

export interface WebhookEvent {
    id: string;
    provider: string;
    payload: any;
    status: 'pending' | 'processed' | 'failed';
    receivedAt: string;
}

export type CRMFilters = {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
};

export interface CRMStat {
    label: string;
    value: string | number;
    trend?: number;
    color?: string;
}
