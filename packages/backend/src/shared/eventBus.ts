import { logger } from './logger';
import { getEventProvider, IEventProvider } from './events/EventProvider';

/**
 * Type-safe definitions of all system events.
 * This acts as the "Contract" between modules.
 */
export interface SystemEvents {
    // Chat Events
    'CHAT_MESSAGE_RECEIVED': {
        neuraKey: string;
        message: string;
        neuraId?: string;
        userId?: string;
        correlationId?: string;
    };

    // Automation Events
    'AUTOMATION_TRIGGERED': {
        agentId: string;
        triggerContext: any;
    };

    // CRM Events
    'LEAD_QUALIFIED': {
        source: string;
        data: any;
        score: number;
    };
}

/**
 * The Central Nervous System of the application.
 * Decouples modules so they don't need to import each other.
 * 
 * ✅ IMPROVEMENT 11: Cloud Native Event Strategy
 * Delegates to either Local Emitter or Google Pub/Sub
 */
class EventBus {
    private provider: IEventProvider;

    constructor() {
        this.provider = getEventProvider();
    }

    /**
     * Emit a type-safe event
     */
    public emitEvent<K extends keyof SystemEvents>(event: K, payload: SystemEvents[K]): boolean {
        // 🔍 Traceability Injection (Simplified for Strategy)
        const tracePayload = { ...payload } as any;

        logger.debug(`[EventBus] Emitting: ${event}`, {
            payload: this.sanitizePayload(tracePayload),
            provider: this.provider.constructor.name
        });

        // Fire and forget (Promise not awaited to match EventEmitter sync signature essentially)
        this.provider.emit(event, tracePayload).catch(err => {
            logger.error(`[EventBus] Emission failed`, { event, error: String(err) });
        });

        return true;
    }

    /**
     * Subscribe to a type-safe event
     */
    public onEvent<K extends keyof SystemEvents>(event: K, listener: (payload: SystemEvents[K]) => void): this {
        logger.info(`[EventBus] Listener registered for: ${event}`);
        this.provider.on(event, listener);
        return this;
    }

    private sanitizePayload(payload: any): any {
        // Basic sanitization for logs (truncate long strings)
        if (typeof payload === 'object' && payload !== null) {
            const copy = { ...payload };
            if (copy.message && copy.message.length > 100) {
                copy.message = copy.message.substring(0, 100) + '...';
            }
            return copy;
        }
        return payload;
    }
}

// Singleton instance
export const eventBus = new EventBus();
