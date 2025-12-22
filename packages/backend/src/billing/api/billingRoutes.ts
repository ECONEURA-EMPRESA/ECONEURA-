import { Router } from 'express';
import { billingService } from '../application/BillingService';
import { stripeService } from '../infra/StripeService';
import { authMiddleware } from '../../api/http/middleware/authMiddleware';
import { logger } from '../../shared/logger';
import express from 'express';

const router = Router();

// Endpoint para inciar suscripción
// POST /api/billing/checkout
router.post('/checkout', authMiddleware, async (req, res) => {
    const user = req.authContext;
    const { priceId } = req.body;

    if (!user) {
        return res.status(401).json({ success: false, error: 'User must be logged in' });
    }

    if (!priceId) {
        return res.status(400).json({ success: false, error: 'Price ID required' });
    }

    // TODO: Obtener email del usuario desde UserRepo o AuthContext (si lo tiene)
    // Por ahora asumimos que AuthContext podría tener email o lo buscamos
    // HARDCODED para prototipo rápido si authContext no tiene email
    const userEmail = (user as any).email || `user-${user.userId}@econeura.com`;

    const result = await billingService.createCheckoutSession(user.userId, userEmail, priceId);

    if (!result.success) {
        return res.status(500).json({ success: false, error: result.error.message });
    }

    return res.json({ success: true, url: result.data.url });
});

// Portal de cliente (gestionar suscripción)
router.post('/portal', authMiddleware, async (req, res) => {
    const user = req.authContext;
    if (!user) return res.status(401).json({ success: false });

    // FIXME: Get real email
    const userEmail = `user-${user.userId}@example.com`;

    const result = await billingService.createPortalSession(user.userId, userEmail);

    if (!result.success) {
        return res.status(400).json({ success: false, error: result.error.message });
    }

    return res.json({ success: true, url: result.data.url });
});

// Webhook de Stripe (Debe ser POST y RAW body handled)
// Nota: El middleware en server.ts debe permitir raw body para esta ruta
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
        return res.status(400).send('Webhook Error: Missing signature');
    }

    try {
        const event = stripeService.constructEvent(req.body, sig as string);

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                logger.info('[Billing] Pago completado!', { sessionId: session.id, customer: session.customer });
                // TODO: Actualizar DB del usuario a PRO
                break;
            case 'customer.subscription.deleted':
                logger.info('[Billing] Suscripción cancelada');
                // TODO: Actualizar DB del usuario a FREE
                break;
            default:
            // logger.debug(`[Billing] Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        logger.error('[Billing] Webhook Error', { error: err instanceof Error ? err.message : String(err) });
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
    }
});

export const billingRoutes = router;
