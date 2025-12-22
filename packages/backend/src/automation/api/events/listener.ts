import { eventBus, type SystemEvents } from '../../../shared/eventBus';
import { executeNeuraAgentFromChat } from '../../application/use-cases/ExecuteNeuraAgent';
import { logger } from '../../../shared/logger';

/**
 * Listener for Automation Events.
 * Decouples the Chat module from the Automation module.
 * 
 * Layer: API (Entry Point for Events)
 */
export function initAutomationListeners() {
    logger.info('[Automation] Initializing Event Listeners...');

    eventBus.onEvent('CHAT_MESSAGE_RECEIVED', async (payload) => {
        logger.debug('[Automation] Processing CHAT_MESSAGE_RECEIVED event', { correlationId: payload.correlationId });

        try {
            // Execute logic asynchronously via UseCase
            // The HTTP response has already been sent to the user (200 OK)
            const result = await executeNeuraAgentFromChat(payload.message, {
                neuraKey: payload.neuraKey,
                neuraId: payload.neuraId || '',
                userId: payload.userId || null,
                correlationId: payload.correlationId
            });

            if (!result.success) {
                logger.error('[Automation] Agent execution failed asynchronously', { error: result.error.message });
                // TODO: Emit FAILURE event or Notify Frontend via Socket/SSE
            } else {
                logger.info('[Automation] Agent executed successfully', {
                    success: result.data.success,
                    message: result.data.message
                });
                // TODO: Emit SUCCESS event or Store in Chat History
            }

        } catch (error) {
            logger.error('[Automation] Unhandled error in listener', { error: error instanceof Error ? error.message : String(error) });
        }
    });

    logger.info('[Automation] Linked to Nervous System (Event Bus).');
}
