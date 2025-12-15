/**
 * ECONEURA - PostgreSQL Deal Store
 * 
 * CRÍTICO: Usa getPostgresPool() compartido, transacciones, y locks.
 */

import { getPostgresPool } from '../../infra/persistence/postgresPool';
import { logger } from '../../shared/logger';
import type { Deal } from '../domain/Deal';
import { ok, err, type Result } from '../../shared/Result';
import { retryDatabase } from '../../shared/utils/retry';
import { mapPostgresError, isPostgresError } from '../../shared/utils/postgresErrorMapper';

/**
 * Obtener deal por lead_id
 */
export async function getDealByLeadId(leadId: string): Promise<Result<Deal | null, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        const result = await client.query('SELECT * FROM crm_deals WHERE lead_id = $1 LIMIT 1', [leadId]);

        if (result.rows.length === 0) {
          return ok(null);
        }

        const row = result.rows[0];
        return ok({
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
          meeting_date: row.meeting_date ? new Date(row.meeting_date) : undefined,
          proposal_sent_at: row.proposal_sent_at ? new Date(row.proposal_sent_at) : undefined,
          closed_date: row.closed_date ? new Date(row.closed_date) : undefined
        } as Deal);
      } catch (error: unknown) {
        if (isPostgresError(error)) {
          throw mapPostgresError(error);
        }
        throw error;
      } finally {
        client.release();
      }
    },
    {
      maxRetries: 3,
      operationName: 'getDealByLeadId'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error obteniendo deal por lead_id', {
      error: error instanceof Error ? error.message : String(error),
      leadId
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

/**
 * Crear deal (en transacción)
 */
export async function createDeal(deal: Deal): Promise<Result<Deal, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        await client.query('BEGIN');

        const result = await client.query(
          `INSERT INTO crm_deals (
            id, lead_id, valor_estimado, revenue, stage, source_method,
            assigned_agent, meeting_date, proposal_sent_at, closed_date,
            lost_reason, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
            deal.id,
            deal.lead_id,
            deal.valor_estimado,
            deal.revenue ?? null,
            deal.stage,
            deal.source_method,
            deal.assigned_agent ?? null,
            deal.meeting_date ?? null,
            deal.proposal_sent_at ?? null,
            deal.closed_date ?? null,
            deal.lost_reason ?? null,
            deal.created_at,
            deal.updated_at
          ]
        );

        await client.query('COMMIT');

        const row = result.rows[0];
        return ok({
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
          meeting_date: row.meeting_date ? new Date(row.meeting_date) : undefined,
          proposal_sent_at: row.proposal_sent_at ? new Date(row.proposal_sent_at) : undefined,
          closed_date: row.closed_date ? new Date(row.closed_date) : undefined
        } as Deal);
      } catch (error: unknown) {
        await client.query('ROLLBACK').catch(() => {
          // Ignorar errores al hacer rollback
        });

        if (isPostgresError(error)) {
          throw mapPostgresError(error);
        }
        throw error;
      } finally {
        client.release();
      }
    },
    {
      maxRetries: 3,
      operationName: 'createDeal'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error creando deal', {
      error: error instanceof Error ? error.message : String(error)
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

/**
 * Actualizar deal (en transacción con lock)
 */
export async function updateDeal(
  dealId: string,
  updates: Partial<Deal>
): Promise<Result<Deal, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        await client.query('BEGIN');

        // Lock el registro (SELECT FOR UPDATE)
        const lockResult = await client.query('SELECT * FROM crm_deals WHERE id = $1 FOR UPDATE', [
          dealId
        ]);

        if (lockResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return err(new Error(`Deal ${dealId} no encontrado`));
        }

        // Construir UPDATE dinámico
        const setParts: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        if (updates.stage !== undefined) {
          setParts.push(`stage = $${paramIndex}`);
          values.push(updates.stage);
          paramIndex++;
        }

        if (updates.revenue !== undefined) {
          setParts.push(`revenue = $${paramIndex}`);
          values.push(updates.revenue);
          paramIndex++;
        }

        if (updates.assigned_agent !== undefined) {
          setParts.push(`assigned_agent = $${paramIndex}`);
          values.push(updates.assigned_agent);
          paramIndex++;
        }

        if (updates.meeting_date !== undefined) {
          setParts.push(`meeting_date = $${paramIndex}`);
          values.push(updates.meeting_date);
          paramIndex++;
        }

        if (updates.proposal_sent_at !== undefined) {
          setParts.push(`proposal_sent_at = $${paramIndex}`);
          values.push(updates.proposal_sent_at);
          paramIndex++;
        }

        if (updates.closed_date !== undefined) {
          setParts.push(`closed_date = $${paramIndex}`);
          values.push(updates.closed_date);
          paramIndex++;
        }

        if (updates.lost_reason !== undefined) {
          setParts.push(`lost_reason = $${paramIndex}`);
          values.push(updates.lost_reason);
          paramIndex++;
        }

        if (setParts.length === 0) {
          await client.query('ROLLBACK');
          return err(new Error('No hay campos para actualizar'));
        }

        setParts.push(`updated_at = NOW()`);
        values.push(dealId);

        const updateQuery = `UPDATE crm_deals SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await client.query(updateQuery, values);

        await client.query('COMMIT');

        const row = result.rows[0];
        return ok({
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
          meeting_date: row.meeting_date ? new Date(row.meeting_date) : undefined,
          proposal_sent_at: row.proposal_sent_at ? new Date(row.proposal_sent_at) : undefined,
          closed_date: row.closed_date ? new Date(row.closed_date) : undefined
        } as Deal);
      } catch (error: unknown) {
        await client.query('ROLLBACK').catch(() => {
          // Ignorar errores al hacer rollback
        });

        if (isPostgresError(error)) {
          throw mapPostgresError(error);
        }
        throw error;
      } finally {
        client.release();
      }
    },
    {
      maxRetries: 3,
      operationName: 'updateDeal'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error actualizando deal', {
      error: error instanceof Error ? error.message : String(error),
      dealId
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

/**
 * Actualizar métricas de agente (ATÓMICO con lock)
 * CRÍTICO: Previene race conditions
 */
export async function updateAgentMetricsAtomic(
  agentName: string,
  metrics: { deals_cerrados?: number; revenue_generado?: number }
): Promise<Result<void, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        await client.query('BEGIN');

        // Lock el registro
        await client.query('SELECT * FROM crm_agents WHERE nombre = $1 FOR UPDATE', [agentName]);

        // Actualizar revenue (atómico)
        if (metrics.revenue_generado) {
          await client.query(
            `UPDATE crm_agents
             SET metrics = jsonb_set(
               metrics,
               '{revenue_generado}',
               to_jsonb((COALESCE((metrics->>'revenue_generado')::numeric, 0) + $1))
             ),
             updated_at = NOW()
             WHERE nombre = $2`,
            [metrics.revenue_generado, agentName]
          );
        }

        // Actualizar deals_cerrados (atómico)
        if (metrics.deals_cerrados) {
          await client.query(
            `UPDATE crm_agents
             SET metrics = jsonb_set(
               metrics,
               '{deals_cerrados}',
               to_jsonb((COALESCE((metrics->>'deals_cerrados')::numeric, 0) + $1))
             ),
             updated_at = NOW()
             WHERE nombre = $2`,
            [metrics.deals_cerrados, agentName]
          );
        }

        await client.query('COMMIT');
        return ok(undefined);
      } catch (error: unknown) {
        await client.query('ROLLBACK').catch(() => {
          // Ignorar errores al hacer rollback
        });

        if (isPostgresError(error)) {
          throw mapPostgresError(error);
        }
        throw error;
      } finally {
        client.release();
      }
    },
    {
      maxRetries: 3,
      operationName: 'updateAgentMetricsAtomic'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error actualizando métricas de agente', {
      error: error instanceof Error ? error.message : String(error),
      agentName
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

