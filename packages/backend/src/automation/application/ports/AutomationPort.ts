import { Result } from '../../../shared/Result';

export interface AutomationPort {
    executeWebhook(webhookUrl: string, payload: any): Promise<Result<any>>;
}
