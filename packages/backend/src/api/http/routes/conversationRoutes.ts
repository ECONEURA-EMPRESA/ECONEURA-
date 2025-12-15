import { Router } from 'express';
import { startConversation } from '../../../conversation/startConversation';
import { appendMessage } from '../../../conversation/appendMessage';
import { getConversationHistory } from '../../../conversation/getConversationHistory';
import { startConversationSchema, appendMessageSchema } from '../validation/conversationSchemas';

const router = Router();

router.post('/api/conversations', async (req, res) => {
  try {
    const parsed = startConversationSchema.parse(req.body);

    const result = await startConversation({
      neuraId: parsed.neuraId,
      userId: parsed.userId ?? null
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }

    return res.status(201).json({ success: true, conversation: result.data });
  } catch (e) {
    if (e instanceof Error && 'issues' in e && typeof (e as { issues?: unknown }).issues !== 'undefined') {
      // Error de Zod
      return res.status(400).json({ success: false, error: e.message });
    }

    const error = e instanceof Error ? e : new Error('Unknown error');
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;

  try {
    const parsed = appendMessageSchema.parse(req.body);

    const result = await appendMessage({
      conversationId: id,
      role: parsed.role,
      content: parsed.content
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }

    return res.status(201).json({ success: true, message: result.data });
  } catch (e) {
    if (e instanceof Error && 'issues' in e && typeof (e as { issues?: unknown }).issues !== 'undefined') {
      return res.status(400).json({ success: false, error: e.message });
    }

    const error = e instanceof Error ? e : new Error('Unknown error');
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await getConversationHistory(id);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error.message });
    }

    return res.status(200).json({ success: true, messages: result.data });
  } catch (e) {
    const error = e instanceof Error ? e : new Error('Unknown error');
    return res.status(500).json({ success: false, error: error.message });
  }
});

export const conversationRoutes = router;


