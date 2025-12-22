import { ok, type Result } from '../../../shared/Result';
import { AutomationPort } from '../../application/ports/AutomationPort';

import { logger } from '../../../shared/logger';

export class MakeAdapter implements AutomationPort {
    async executeWebhook(webhookUrl: string, payload: any): Promise<Result<any>> {
        logger.info('[MakeAdapter] Executing webhook:', { webhookUrl });
        return ok({ status: 'success', stub: true });
    }
}
