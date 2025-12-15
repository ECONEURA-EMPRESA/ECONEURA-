import { z } from 'zod';

export const startConversationSchema = z.object({
  neuraId: z.string().min(1, 'neuraId is required'),
  userId: z.string().min(1).optional()
});

export const appendMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'content is required')
});

export const sendNeuraChatSchema = z.object({
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1, 'message is required'),
  userId: z.string().min(1).optional(),
  correlationId: z.string().min(1).optional()
});


