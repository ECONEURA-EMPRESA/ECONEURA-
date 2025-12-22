import { stripeService } from '../infra/StripeService';
import { logger } from '../../shared/logger';
import type { Result } from '../../shared/Result';
import { ok, err } from '../../shared/Result';

export class BillingService {
    async createCheckoutSession(userId: string, email: string, priceId: string): Promise<Result<{ url: string }, Error>> {
        const stripe = stripeService.getClient();
        if (!stripe || !stripeService.isReady()) {
            return err(new Error('Billing system not available'));
        }

        try {
            // 1. Buscar o crear cliente en Stripe (Simplificado: asumimos creación por ahora o búsqueda por email)
            const clients = await stripe.customers.list({ email: email, limit: 1 });
            let customerId = clients.data.length > 0 ? clients.data[0].id : null;

            if (!customerId) {
                const newCustomer = await stripe.customers.create({
                    email,
                    metadata: { userId }
                });
                customerId = newCustomer.id;
            }

            // 2. Crear sesión
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.APP_URL || 'https://econeura-109cc.web.app'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.APP_URL || 'https://econeura-109cc.web.app'}/billing/cancel`,
                metadata: {
                    userId,
                },
            });

            if (!session.url) {
                return err(new Error('Stripe failed to return session URL'));
            }

            return ok({ url: session.url });
        } catch (error) {
            logger.error('[BillingService] Error creating checkout', { error });
            return err(error instanceof Error ? error : new Error('Unknown Stripe error'));
        }
    }

    async createPortalSession(userId: string, email: string): Promise<Result<{ url: string }, Error>> {
        const stripe = stripeService.getClient();
        if (!stripe || !stripeService.isReady()) {
            return err(new Error('Billing system not available'));
        }

        try {
            const clients = await stripe.customers.list({ email: email, limit: 1 });
            if (clients.data.length === 0) {
                return err(new Error('No billing account found for this user'));
            }

            const sessionUrl = await stripeService.createCustomerPortalSession(clients.data[0].id);
            return ok({ url: sessionUrl });
        } catch (error) {
            return err(error instanceof Error ? error : new Error('Portal creation failed'));
        }
    }
}

export const billingService = new BillingService();
