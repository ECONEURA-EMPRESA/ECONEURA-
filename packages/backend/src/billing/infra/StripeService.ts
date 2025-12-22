import Stripe from 'stripe';
import { getValidatedEnv } from '../../config/env';
import { logger } from '../../shared/logger';

export class StripeService {
    private stripe: Stripe | null = null;
    private isEnabled = false;

    constructor() {
        const env = getValidatedEnv();
        if (env.STRIPE_SECRET_KEY) {
            this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
                apiVersion: '2025-12-15.clover',
                typescript: true,
            });
            this.isEnabled = true;
            logger.info('[StripeService] Stripe inicializado correctamente');
        } else {
            logger.warn('[StripeService] STRIPE_SECRET_KEY no configurada. Billing deshabilitado.');
        }
    }

    public getClient(): Stripe | null {
        return this.stripe;
    }

    public isReady(): boolean {
        return this.isEnabled && this.stripe !== null;
    }

    // Helper para construir la URL del portal
    public async createCustomerPortalSession(customerId: string): Promise<string> {
        if (!this.stripe) throw new Error('Stripe not configured');

        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.APP_URL || 'https://econeura-109cc.web.app'}/dashboard`,
        });
        return session.url;
    }

    // Validar firma de webhook
    public constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
        if (!this.stripe) throw new Error('Stripe not configured');
        const env = getValidatedEnv();
        if (!env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

        return this.stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    }
}

export const stripeService = new StripeService();
