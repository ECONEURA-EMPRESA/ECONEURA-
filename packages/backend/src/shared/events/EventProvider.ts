import { EventEmitter } from 'events';
import { PubSub } from '@google-cloud/pubsub';
import { logger } from '../logger';

/**
 * Strategy Interface for Event Emission
 */
export interface IEventProvider {
    emit(event: string, payload: any): Promise<void>;
    on(event: string, listener: (payload: any) => void): void;
}

/**
 * Local InMemory Implementation (Development)
 */
export class LocalEventProvider implements IEventProvider {
    private emitter = new EventEmitter();

    constructor() {
        this.emitter.setMaxListeners(20);
    }

    async emit(event: string, payload: any): Promise<void> {
        this.emitter.emit(event, payload);
    }

    on(event: string, listener: (payload: any) => void): void {
        this.emitter.on(event, listener);
    }
}

/**
 * Google Cloud Pub/Sub Implementation (Production)
 */
export class PubSubEventProvider implements IEventProvider {
    private pubsub: PubSub;
    private topicCache: Map<string, any> = new Map();

    constructor() {
        this.pubsub = new PubSub();
    }

    async emit(event: string, payload: any): Promise<void> {
        try {
            // Map event name to a normalized topic name (e.g. CHAT_MESSAGE_RECEIVED -> chat-message-received)
            const topicName = event.toLowerCase().replace(/_/g, '-');
            const dataBuffer = Buffer.from(JSON.stringify(payload));

            // In a real scenario, topics should be pre-provisioned via Terraform
            // We just publish here.
            await this.pubsub.topic(topicName).publishMessage({ data: dataBuffer });
        } catch (error) {
            logger.error(`[PubSub] Failed to publish to ${event}`, { error: String(error) });
        }
    }

    on(event: string, listener: (payload: any) => void): void {
        // Pub/Sub subscription logic is complex (pull vs push). 
        // For this abstraction, we might need a dedicated worker process that Subscribes.
        // For simplicity in this "Hybrid" Monolith, we might not strictly implement 'on' here 
        // unless we are running a worker.
        logger.warn('[PubSub] Subscription not fully implemented in this Provider abstraction yet.');
    }
}

/**
 * Factory
 */
export function getEventProvider(): IEventProvider {
    if (process.env['USE_PUBSUB'] === 'true') {
        return new PubSubEventProvider();
    }
    return new LocalEventProvider();
}
