/**
 * ECONEURA - CRM Webhook Routes
 * 
 * Webhooks seguros para integración con N8N.
 * Validación HMAC, rate limiting, transacciones.
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { getValidatedEnv } from '../../config/env';
import { getPostgresPool } from '../../infra/persistence/postgresPool';
import { createLead, getLeadByEmail, getLeadById, updateLead } from '../infra/postgresLeadStore';
import { createConversation } from '../infra/postgresConversationStore';
import { getDealByLeadId, createDeal, updateDeal } from '../infra/postgresDealStore';
import { updateAgentMetricsAtomic } from '../infra/postgresDealStore';
import { validateAgent } from '../application/validateAgent';
import { invalidateSalesMetricsCache } from '../infra/salesMetricsCache';
import { logger } from '../../shared/logger';
import type { RequestWithId } from '../../api/http/middleware/requestId';
import { webhookRateLimiter } from '../../api/http/middleware/webhookRateLimiter';
import { payloadSizeMiddleware } from '../../api/http/middleware/payloadSize';
import { randomUUID } from 'crypto';
import type { Lead } from '../domain/Lead';
import type { Conversation } from '../infra/postgresConversationStore';
import type { Deal } from '../domain/Deal';

const router = Router();

// Aplicar rate limiting y payload size a todos los webhooks
router.use(webhookRateLimiter);
router.use(payloadSizeMiddleware({ maxSizeBytes: 100 * 1024 })); // 100KB

/**
 * Validar HMAC signature
 */
function validateHMAC(body: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Middleware de autenticación webhook (HMAC)
 */
function webhookAuthMiddleware(req: Request, res: Response, next: () => void): void {
  const env = getValidatedEnv();
  const secret = env.CRM_WEBHOOK_SECRET;

  if (!secret) {
    logger.warn('[CRM Webhooks] CRM_WEBHOOK_SECRET no configurado, validación deshabilitada');
    next();
    return;
  }

  const signature = req.headers['x-webhook-signature'] as string | undefined;
  const body = JSON.stringify(req.body);

  if (!signature || !validateHMAC(body, signature, secret)) {
    const reqWithId = req as RequestWithId;
    logger.warn('[CRM Webhooks] Firma HMAC inválida', {
      path: req.path,
      ip: req.ip,
      hasSignature: !!signature,
      requestId: reqWithId.id
    });
    res.status(401).json({
      success: false,
      error: 'Invalid signature',
      code: 'WEBHOOK_AUTH_FAILED'
    });
    return;
  }

  next();
  return;
}

/**
 * POST /api/crm/webhooks/lead-created
 * Webhook para cuando un agente IA crea un nuevo lead
 */
const leadCreatedSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(1),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  cargo: z.string().optional(),
  score: z.number().min(1).max(10).optional(),
  department: z.enum(['cmo', 'cso']),
  agent_name: z.string().min(1),
  source_channel: z.string().optional(),
  enrichment_data: z.record(z.string(), z.unknown()).optional()
});

router.post('/lead-created', webhookAuthMiddleware, async (req: Request, res: Response) => {
  const reqWithId = req as RequestWithId;

  try {
    // Validar payload
    const payload = leadCreatedSchema.parse(req.body);

    // Validar agente
    const agentValidation = await validateAgent(payload.agent_name, payload.department);
    if (!agentValidation.valid) {
      logger.warn('[CRM Webhooks] Agente inválido', {
        agent_name: payload.agent_name,
        department: payload.department,
        reason: agentValidation.reason,
        requestId: reqWithId.id
      });
      return res.status(400).json({
        success: false,
        error: agentValidation.reason ?? 'Invalid agent',
        code: 'INVALID_AGENT'
      });
    }

    // Verificar si lead ya existe (idempotencia)
    const existingLead = await getLeadByEmail(payload.email);
    if (existingLead.success && existingLead.data) {
      logger.info('[CRM Webhooks] Lead ya existe, retornando existente', {
        email: payload.email,
        leadId: existingLead.data.id,
        requestId: reqWithId.id
      });
      return res.status(200).json({
        success: true,
        data: existingLead.data,
        message: 'Lead ya existe'
      });
    }

    // Crear lead (en transacción)
    const client = await getPostgresPool().connect();
    try {
      await client.query('BEGIN');

      const lead: Lead = {
        id: randomUUID(),
        email: payload.email,
        nombre: payload.nombre,
        ...(payload.empresa ? { empresa: payload.empresa } : {}),
        ...(payload.telefono ? { telefono: payload.telefono } : {}),
        ...(payload.cargo ? { cargo: payload.cargo } : {}),
        score: payload.score ?? 5,
        status: 'new' as const,
        department: payload.department,
        ...(payload.source_channel ? { source_channel: payload.source_channel } : {}),
        source_method: 'ia' as const,
        assigned_agent: payload.agent_name,
        enrichment_data: payload.enrichment_data ?? {},
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await createLead(lead);

      if (!result.success) {
        await client.query('ROLLBACK');
        throw result.error;
      }

      await client.query('COMMIT');

      // Invalidar caché de métricas
      await invalidateSalesMetricsCache(payload.department);

      logger.info('[CRM Webhooks] Lead creado', {
        leadId: result.data.id,
        email: payload.email,
        agent_name: payload.agent_name,
        department: payload.department,
        requestId: reqWithId.id
      });

      res.status(201).json({
        success: true,
        data: result.data
      });
      return;
    } catch (error: unknown) {
      await client.query('ROLLBACK').catch(() => {
        // Ignorar errores al hacer rollback
      });
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('[CRM Webhooks] Payload inválido', {
        errors: error.issues,
        requestId: reqWithId.id
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    logger.error('[CRM Webhooks] Error procesando lead-created', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
});

/**
 * POST /api/crm/webhooks/conversation
 * Webhook para cuando un agente IA tiene una conversación con un lead
 */
const conversationSchema = z.object({
  lead_id: z.string().uuid(),
  mensaje: z.string().min(1),
  agent_name: z.string().min(1),
  direction: z.enum(['inbound', 'outbound']),
  intent: z.enum(['positivo', 'neutro', 'negativo']).optional()
});

router.post('/conversation', webhookAuthMiddleware, async (req: Request, res: Response) => {
  const reqWithId = req as RequestWithId;

  try {
    const payload = conversationSchema.parse(req.body);

    const conversation: Conversation = {
      id: randomUUID(),
      lead_id: payload.lead_id,
      mensaje: payload.mensaje,
      agent_name: payload.agent_name,
      direction: payload.direction,
      ...(payload.intent ? { intent: payload.intent } : {}),
      timestamp: new Date()
    };

    const result = await createConversation(conversation);

    if (!result.success) {
      throw result.error;
    }

    logger.info('[CRM Webhooks] Conversación creada', {
      conversationId: result.data.id,
      lead_id: payload.lead_id,
      agent_name: payload.agent_name,
      requestId: reqWithId.id
    });

    res.status(201).json({
      success: true,
      data: result.data
    });
    return;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues,
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    logger.error('[CRM Webhooks] Error procesando conversation', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
});

/**
 * POST /api/crm/webhooks/deal-stage-change
 * Webhook para cuando un deal cambia de stage
 */
const dealStageChangeSchema = z.object({
  lead_id: z.string().uuid(),
  new_stage: z.enum(['meeting_scheduled', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost']),
  agent_name: z.string().min(1),
  revenue: z.number().optional(), // Solo cuando closed_won
  meeting_date: z.string().datetime().optional(),
  proposal_sent_at: z.string().datetime().optional(),
  closed_date: z.string().datetime().optional(),
  lost_reason: z.string().optional()
});

router.post('/deal-stage-change', webhookAuthMiddleware, async (req: Request, res: Response) => {
  const reqWithId = req as RequestWithId;

  try {
    const payload = dealStageChangeSchema.parse(req.body);

    // Validar agente
    const agentValidation = await validateAgent(payload.agent_name, 'cso');
    if (!agentValidation.valid) {
      return res.status(400).json({
        success: false,
        error: agentValidation.reason ?? 'Invalid agent',
        code: 'INVALID_AGENT'
      });
    }

    // Validar revenue solo cuando closed_won
    if (payload.new_stage === 'closed_won' && (!payload.revenue || payload.revenue <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'revenue es requerido cuando stage es closed_won',
        code: 'MISSING_REVENUE'
      });
    }

    if (payload.new_stage !== 'closed_won' && payload.revenue) {
      return res.status(400).json({
        success: false,
        error: 'revenue solo puede ser especificado cuando stage es closed_won',
        code: 'INVALID_REVENUE'
      });
    }

    // Transacción completa
    const pool = getPostgresPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener o crear deal
      let deal = await getDealByLeadId(payload.lead_id);
      if (!deal.success || !deal.data) {
        // Crear deal si no existe
        const newDeal: Deal = {
          id: randomUUID(),
          lead_id: payload.lead_id,
          valor_estimado: payload.revenue ?? 0,
          ...(payload.new_stage === 'closed_won' && payload.revenue ? { revenue: payload.revenue } : {}),
          stage: payload.new_stage,
          source_method: 'ia' as const,
          assigned_agent: payload.agent_name,
          ...(payload.meeting_date ? { meeting_date: new Date(payload.meeting_date) } : {}),
          ...(payload.proposal_sent_at ? { proposal_sent_at: new Date(payload.proposal_sent_at) } : {}),
          ...(payload.closed_date ? { closed_date: new Date(payload.closed_date) } : {}),
          ...(payload.lost_reason ? { lost_reason: payload.lost_reason } : {}),
          created_at: new Date(),
          updated_at: new Date()
        };

        const createResult = await createDeal(newDeal);
        if (!createResult.success) {
          await client.query('ROLLBACK');
          throw createResult.error;
        }
        deal = createResult;
      } else {
        // Actualizar deal existente
        const updateData: Partial<Deal> = {
          stage: payload.new_stage,
          assigned_agent: payload.agent_name
        };
        if (payload.new_stage === 'closed_won' && payload.revenue) {
          updateData.revenue = payload.revenue;
        }
        if (payload.meeting_date) {
          updateData.meeting_date = new Date(payload.meeting_date);
        }
        if (payload.proposal_sent_at) {
          updateData.proposal_sent_at = new Date(payload.proposal_sent_at);
        }
        if (payload.closed_date) {
          updateData.closed_date = new Date(payload.closed_date);
        }
        if (payload.lost_reason) {
          updateData.lost_reason = payload.lost_reason;
        }
        const updateResult = await updateDeal(deal.data.id, updateData);

        if (!updateResult.success) {
          await client.query('ROLLBACK');
          throw updateResult.error;
        }
        deal = updateResult;
      }

      // Actualizar métricas del agente (atómico)
      if (payload.new_stage === 'closed_won' && payload.revenue) {
        await updateAgentMetricsAtomic(payload.agent_name, {
          deals_cerrados: 1,
          revenue_generado: payload.revenue
        });
      }

      await client.query('COMMIT');

      // Invalidar caché de métricas
      await invalidateSalesMetricsCache('cso');

      logger.info('[CRM Webhooks] Deal actualizado', {
        dealId: deal.success && deal.data ? deal.data.id : 'unknown',
        new_stage: payload.new_stage,
        agent_name: payload.agent_name,
        requestId: reqWithId.id
      });

      res.status(200).json({
        success: true,
        data: deal.success && deal.data ? deal.data : null
      });
      return;
    } catch (error: unknown) {
      await client.query('ROLLBACK').catch(() => {
        // Ignorar errores al hacer rollback
      });
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues,
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    logger.error('[CRM Webhooks] Error procesando deal-stage-change', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
});

/**
 * POST /api/crm/webhooks/lead-updated
 * Webhook para cuando un agente actualiza un lead (score, status, etc.)
 */
const leadUpdatedSchema = z.object({
  lead_id: z.string().uuid(),
  score: z.number().min(1).max(10).optional(), // Score 1-10 según dominio Lead
  status: z.enum(['new', 'qualified', 'contacted', 'lost']).optional(),
  agent_name: z.string().min(1),
  scoring_details: z.record(z.string(), z.unknown()).optional()
});

router.post('/lead-updated', webhookAuthMiddleware, async (req: Request, res: Response) => {
  const reqWithId = req as RequestWithId;

  try {
    const payload = leadUpdatedSchema.parse(req.body);

    // Validar agente
    const agentValidation = await validateAgent(payload.agent_name, 'cmo');
    if (!agentValidation.valid) {
      logger.warn('[CRM Webhooks] Agente inválido', {
        agent_name: payload.agent_name,
        reason: agentValidation.reason,
        requestId: reqWithId.id
      });
      return res.status(400).json({
        success: false,
        error: agentValidation.reason ?? 'Invalid agent',
        code: 'INVALID_AGENT'
      });
    }

    // Verificar que el lead existe
    const existingLead = await getLeadById(payload.lead_id);
    if (!existingLead.success || !existingLead.data) {
      return res.status(404).json({
        success: false,
        error: 'Lead no encontrado',
        code: 'LEAD_NOT_FOUND'
      });
    }

    // Actualizar lead
    const client = await getPostgresPool().connect();
    try {
      await client.query('BEGIN');

      const updateData: Partial<Pick<Lead, 'score' | 'status' | 'assigned_agent' | 'enrichment_data'>> = {};

      if (payload.score !== undefined) {
        updateData.score = payload.score;
      }

      if (payload.status !== undefined) {
        updateData.status = payload.status;
      }

      // Guardar scoring_details en enrichment_data
      if (payload.scoring_details) {
        updateData.enrichment_data = {
          ...existingLead.data.enrichment_data,
          scoring_details: payload.scoring_details,
          last_scored_at: new Date().toISOString(),
          scored_by: payload.agent_name
        };
      }

      const result = await updateLead(payload.lead_id, updateData);

      if (!result.success) {
        await client.query('ROLLBACK');
        throw result.error;
      }

      await client.query('COMMIT');

      // Invalidar caché de métricas
      await invalidateSalesMetricsCache(existingLead.data.department);

      logger.info('[CRM Webhooks] Lead actualizado', {
        leadId: payload.lead_id,
        score: payload.score,
        status: payload.status,
        agent_name: payload.agent_name,
        requestId: reqWithId.id
      });

      res.status(200).json({
        success: true,
        data: result.data
      });
      return;
    } catch (error: unknown) {
      await client.query('ROLLBACK').catch(() => {
        // Ignorar errores al hacer rollback
      });
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('[CRM Webhooks] Payload inválido', {
        errors: error.issues,
        requestId: reqWithId.id
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    logger.error('[CRM Webhooks] Error procesando lead-updated', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
});

/**
 * POST /api/crm/webhooks/alert
 * Webhook para alertas generadas por agentes (deals en riesgo, oportunidades, etc.)
 */
const alertSchema = z.object({
  type: z.enum(['success', 'warning', 'critical', 'info']),
  message: z.string().min(1),
  deal_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  agent_name: z.string().min(1),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  recommended_action: z.string().optional()
});

router.post('/alert', webhookAuthMiddleware, async (req: Request, res: Response) => {
  const reqWithId = req as RequestWithId;

  try {
    const payload = alertSchema.parse(req.body);

    // Validar agente
    const agentValidation = await validateAgent(payload.agent_name, 'cmo');
    if (!agentValidation.valid) {
      return res.status(400).json({
        success: false,
        error: agentValidation.reason ?? 'Invalid agent',
        code: 'INVALID_AGENT'
      });
    }

    // Las alertas se loguean y se pueden mostrar en el dashboard
    // Por ahora solo las logueamos (en el futuro se pueden guardar en BD)
    logger.info('[CRM Webhooks] Alerta generada', {
      type: payload.type,
      message: payload.message,
      deal_id: payload.deal_id,
      lead_id: payload.lead_id,
      agent_name: payload.agent_name,
      risk_level: payload.risk_level,
      requestId: reqWithId.id
    });

    // Invalidar caché para que el dashboard muestre la alerta
    await invalidateSalesMetricsCache('cmo');

    res.status(201).json({
      success: true,
      data: {
        id: randomUUID(),
        type: payload.type,
        message: payload.message,
        timestamp: new Date().toISOString(),
        agent_name: payload.agent_name
      }
    });
    return;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues,
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    logger.error('[CRM Webhooks] Error procesando alert', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
});

export { router as webhookRoutes };

