import { Router } from 'express';
// import { executeNeuraAgentFromChat } from '../../../automation/neuraAgentExecutor'; // REMOVED: Direct Coupling
import { eventBus } from '../../../shared/eventBus';
import { requireRoles } from '../middleware/rbacMiddleware';

import { z } from 'zod';

const router = Router();

const executeAgentSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'message is required'),
    neuraId: z.string().optional(),
    userId: z.string().optional(),
    correlationId: z.string().optional()
  }),
  params: z.object({
    neuraKey: z.string().min(1)
  })
});

router.post('/api/chat/:neuraKey/execute-agent', requireRoles('admin', 'user'), async (req, res) => {
  try {
    const { body, params } = executeAgentSchema.parse({
      body: req.body,
      params: req.params
    });

    const { neuraKey } = params;
    const { message, neuraId, userId, correlationId } = body;

    // 🔥 DECOUPLING: Fire and Forget via Event Bus
    // The previous implementation blocked the HTTP request waiting for the Agent.
    // Now we return 202 Accepted immediately and let the Nervous System handle it.

    eventBus.emitEvent('CHAT_MESSAGE_RECEIVED', {
      neuraKey,
      message,
      neuraId: neuraId ?? undefined,
      userId: userId ?? undefined,
      correlationId: correlationId ?? undefined
    });

    return res.status(202).json({
      success: true,
      message: 'Message retained for processing.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input parameters',
        details: error.errors
      });
    }

    const err = error instanceof Error ? error : new Error('Unknown error');
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export const chatRoutes = router;


