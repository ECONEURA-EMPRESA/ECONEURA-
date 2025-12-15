import { Router } from 'express';
import { sendNeuraMessage } from '../../../conversation/sendNeuraMessage';
import { sendNeuraChatSchema } from '../validation/conversationSchemas';
import { requireRoles } from '../middleware/rbacMiddleware';
import type { NeuraId } from '../../../shared/types';

const router = Router();

router.post('/api/neuras/:neuraId/chat', requireRoles('admin', 'user'), async (req, res) => {
  const { neuraId } = req.params;

  if (!neuraId) {
    return res.status(400).json({ success: false, error: 'Missing neuraId' });
  }

  const normalizedNeuraId = neuraId.toLowerCase();
  const authContext = req.authContext;

  try {
    const parsed = sendNeuraChatSchema.parse(req.body);

    const result = await sendNeuraMessage({
      neuraId: normalizedNeuraId as NeuraId,
      tenantId: authContext?.tenantId ?? null,
      conversationId: parsed.conversationId ?? undefined,
      message: parsed.message,
      userId: parsed.userId ?? authContext?.userId ?? null,
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
