import { Router } from 'express';
import { sendNeuraMessage } from '../../../conversation/sendNeuraMessage';
import { sendNeuraChatSchema } from '../validation/conversationSchemas';
import { requireRoles } from '../middleware/rbacMiddleware';
import type { NeuraId } from '../../../shared/types';

const router = Router();

// ✅ PUBLIC CHAT API: Sin restricciones de rol ni auth obligatorio
router.post('/api/neuras/:neuraId/chat', async (req, res) => {
  const { neuraId } = req.params;

  if (!neuraId) {
    return res.status(400).json({ success: false, error: 'Missing neuraId' });
  }

  const normalizedNeuraId = neuraId.toLowerCase();

  // Auth context es opcional ahora (bypass auth middleware)
  const authContext = req.authContext;

  // Fallback para userId si no hay auth
  const guestId = `guest-${Date.now().toString(36)}`;

  try {
    const parsed = sendNeuraChatSchema.parse(req.body);

    const result = await sendNeuraMessage({
      neuraId: normalizedNeuraId as NeuraId,
      tenantId: authContext?.tenantId ?? 'public-tenant',
      conversationId: parsed.conversationId ?? undefined,
      message: parsed.message,
      // Usar userId del body, o del auth context, o generar uno guest
      userId: parsed.userId ?? authContext?.userId ?? guestId,
      correlationId: parsed.correlationId ?? undefined
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }

    return res.status(200).json({
      success: true,
      conversationId: result.data.conversationId,
      userMessage: result.data.userMessage,
      neuraReply: result.data.neuraReply
    });
  } catch (e) {
    if (e instanceof Error && 'issues' in e && typeof (e as { issues?: unknown }).issues !== 'undefined') {
      return res.status(400).json({ success: false, error: e.message });
    }

    const error = e instanceof Error ? e : new Error('Unknown error');
    return res.status(500).json({ success: false, error: error.message });
  }
});

export const neuraChatRoutes = router;
