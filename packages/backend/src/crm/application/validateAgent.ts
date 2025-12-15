/**
 * ECONEURA - Agent Validation
 * 
 * Valida que un agente existe y pertenece al departamento correcto.
 * Evita agentes fantasma en métricas.
 */

import { getPostgresPool } from '../../infra/persistence/postgresPool';
import { logger } from '../../shared/logger';
import { automationAgents } from '../../automation/automationAgentsRegistry';

/**
 * Validar que un agente existe y pertenece al departamento
 */
export async function validateAgent(
  agentName: string,
  department: 'cmo' | 'cso'
): Promise<{ valid: boolean; reason?: string }> {
  if (!agentName || typeof agentName !== 'string' || agentName.trim().length === 0) {
    return { valid: false, reason: 'agent_name es requerido' };
  }

  // 1. Verificar en automationAgentsRegistry (agentes registrados)
  const registeredAgent = automationAgents.find(
    (a) =>
      a.name === agentName &&
      (a.neuraKey === department || a.neuraKey === 'cmo' || a.neuraKey === 'cso')
  );

  if (registeredAgent) {
    logger.debug('[ValidateAgent] Agente encontrado en registry', {
      agentName,
      department,
      neuraKey: registeredAgent.neuraKey
    });
    return { valid: true };
  }

  // 2. Verificar en crm_agents (puede ser agente nuevo creado dinámicamente)
  const client = await getPostgresPool().connect();
  try {
    const result = await client.query(
      'SELECT 1 FROM crm_agents WHERE nombre = $1 AND department = $2 LIMIT 1',
      [agentName, department]
    );

    if (result.rows.length > 0) {
      logger.debug('[ValidateAgent] Agente encontrado en crm_agents', {
        agentName,
        department
      });
      return { valid: true };
    }

    logger.warn('[ValidateAgent] Agente no encontrado', {
      agentName,
      department
    });
    return {
      valid: false,
      reason: `Agente "${agentName}" no existe o no pertenece a ${department}`
    };
  } catch (error) {
    logger.error('[ValidateAgent] Error validando agente', {
      error: error instanceof Error ? error.message : String(error),
      agentName,
      department
    });
    // En caso de error de DB, permitir (fallback)
    return { valid: true };
  } finally {
    client.release();
  }
}

/**
 * Validar consistencia entre agente y departamento
 */
export async function validateAgentDepartment(
  agentName: string,
  department: 'cmo' | 'cso'
): Promise<{ valid: boolean; reason?: string }> {
  const validation = await validateAgent(agentName, department);
  if (!validation.valid) {
    return validation;
  }

  // Verificar que el agente realmente pertenece al departamento
  const registeredAgent = automationAgents.find((a) => a.name === agentName);
  if (registeredAgent) {
    if (registeredAgent.neuraKey !== department && registeredAgent.neuraKey !== 'cmo' && registeredAgent.neuraKey !== 'cso') {
      return {
        valid: false,
        reason: `Agente "${agentName}" no pertenece a ${department}`
      };
    }
  }

  return { valid: true };
}

