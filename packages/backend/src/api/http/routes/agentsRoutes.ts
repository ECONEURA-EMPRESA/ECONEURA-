/**
 * ECONEURA - Agents API Routes
 * Gestión de agentes automatizados (Make/n8n/Zapier)
 * Migrado desde ECONEURA-REMOTE/backend/api/agents.js
 */
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { automationService } from '../../../automation/automationService';
import { getAutomationAgentById, automationAgents } from '../../../automation/automationAgentsRegistry';
import { sendResult } from '../httpResult';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from '../../http/middleware/requestId';

const router = Router();

// Schemas de validación
const createAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  platform: z.enum(['make', 'n8n', 'zapier', 'powerautomate', 'econeura', 'custom']),
  webhook_url: z.string().url().optional(),
  neura_assigned: z.string().min(1),
  schedule: z.string().default('on-demand'),
  config: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional()
});

const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  schedule: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'paused']).optional()
});

const executeAgentSchema = z.object({
  params: z.record(z.string(), z.unknown()).optional(),
  triggered_by: z.string().default('user')
});

/**
 * GET /api/agents
 * Listar agentes disponibles (por ahora solo los del registry)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // const reqWithId = req as RequestWithId;
    const { platform, neura_assigned } = req.query;

    // Por ahora, listamos todos los agentes del registry
    // En el futuro, esto vendrá de la base de datos
    const allAgents = automationAgents.filter((a) => a.active);

    let filtered = allAgents;

    if (platform && typeof platform === 'string') {
      filtered = filtered.filter((a) => a.provider === platform);
    }

    if (neura_assigned && typeof neura_assigned === 'string') {
      filtered = filtered.filter((a) => a.neuraKey === neura_assigned);
    }

    return res.json({
      success: true,
      agents: filtered.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        platform: agent.provider,
        neura_assigned: agent.neuraKey,
        status: agent.active ? 'active' : 'inactive',
        created_at: new Date().toISOString()
      })),
      total: filtered.length
    });
  } catch (error) {
    logger.error('[Agents API] Error listando agentes', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/agents/:id
 * Obtener detalles de un agente específico
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID requerido' });
    }

    const agentResult = getAutomationAgentById(id);

    if (!agentResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Agente no encontrado'
      });
    }

    const agent = agentResult.data;

    return res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        platform: agent.provider,
        neura_assigned: agent.neuraKey,
        status: agent.active ? 'active' : 'inactive',
        webhook_url: agent.webhookUrl ?? undefined,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('[Agents API] Error obteniendo agente', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/agents/:id/execute
 * Ejecutar un agente manualmente
 */
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID requerido' });
    }

    const parsed = executeAgentSchema.parse(req.body);

    const agentResult = getAutomationAgentById(id);

    if (!agentResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Agente no encontrado'
      });
    }

    const agent = agentResult.data;

    if (!agent.active) {
      return res.status(400).json({
        success: false,
        error: 'Agente no está activo'
      });
    }

    const executionResult = await automationService.executeByAgentId(id, {
      input: parsed.params ?? {},
      userId: reqWithId.authContext?.userId ?? null,
      correlationId: reqWithId.id,
      authContext: reqWithId.authContext
    });

    if (!executionResult.success) {
      return sendResult(res, executionResult);
    }

    return res.json({
      success: true,
      execution_id: `exec-${Date.now()}`,
      status: executionResult.data.status,
      result: executionResult.data
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.issues
      });
    }

    logger.error('[Agents API] Error ejecutando agente', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/agents
 * Crear un nuevo agente (stub - por ahora solo retorna éxito)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const parsed = createAgentSchema.parse(req.body);

    // Por ahora, solo validamos y retornamos éxito
    logger.info('[Agents API] Creando agente (stub)', {
      name: parsed.name,
      platform: parsed.platform,
      requestId: reqWithId.id
    });

    return res.status(201).json({
      success: true,
      agent: {
        id: `agent-${Date.now()}`,
        name: parsed.name,
        platform: parsed.platform,
        neura_assigned: parsed.neura_assigned,
        status: 'active',
        created_at: new Date().toISOString()
      },
      message: 'Agente creado (stub - persistencia pendiente)'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.issues
      });
    }

    logger.error('[Agents API] Error creando agente', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/agents/:id
 * Actualizar configuración de un agente (stub)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const { id } = req.params;
    updateAgentSchema.parse(req.body);

    // Por ahora, solo validamos
    logger.info('[Agents API] Actualizando agente (stub)', {
      agentId: id,
      requestId: reqWithId.id
    });

    return res.json({
      success: true,
      agent: {
        id,
        updated_at: new Date().toISOString()
      },
      message: 'Agente actualizado (stub - persistencia pendiente)'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.issues
      });
    }

    logger.error('[Agents API] Error actualizando agente', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/agents/:id
 * Eliminar un agente (stub)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const { id } = req.params;

    logger.info('[Agents API] Eliminando agente (stub)', {
      agentId: id,
      requestId: reqWithId.id
    });

    return res.json({
      success: true,
      message: 'Agente eliminado (stub - persistencia pendiente)'
    });
  } catch (error) {
    logger.error('[Agents API] Error eliminando agente', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export const agentsRoutes = router;
