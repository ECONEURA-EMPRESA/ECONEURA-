/**
 * ECONEURA - PostgreSQL Lead Store
 * 
 * CRÍTICO: Usa getPostgresPool() compartido, NO crear Pool propio.
 * Incluye retry, manejo de errores PostgreSQL, y transacciones.
 */

import { getPostgresPool } from '../../infra/persistence/postgresPool';
import { logger } from '../../shared/logger';
import type { Lead } from '../domain/Lead';
import { ok, err, type Result } from '../../shared/Result';
import { retryDatabase } from '../../shared/utils/retry';
import { mapPostgresError, isPostgresError } from '../../shared/utils/postgresErrorMapper';

/**
 * Crear lead
 * Maneja duplicados elegantly (retorna lead existente si email duplicado)
 */
export async function createLead(lead: Lead): Promise<Result<Lead, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        const result = await client.query(
          `INSERT INTO crm_leads (
            id, email, nombre, empresa, telefono, cargo, score, status,
            department, source_channel, source_method, assigned_agent,
            enrichment_data, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *`,
          [
            lead.id,
            lead.email,
            lead.nombre,
            lead.empresa ?? null,
            lead.telefono ?? null,
            lead.cargo ?? null,
            lead.score,
            lead.status,
            lead.department,
            lead.source_channel ?? null,
            lead.source_method,
            lead.assigned_agent ?? null,
            JSON.stringify(lead.enrichment_data),
            lead.created_at,
            lead.updated_at
          ]
        );

        const row = result.rows[0];
        return ok({
          ...row,
          enrichment_data: typeof row.enrichment_data === 'string' ? JSON.parse(row.enrichment_data) : row.enrichment_data,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        } as Lead);
      } catch (error: unknown) {
        // Manejar duplicados elegantly
        if (isPostgresError(error)) {
          const pgError = error as Error & { code?: string; constraint?: string };
          if (pgError.code === '23505' && pgError.constraint === 'crm_leads_email_key') {
            logger.info('[CRM] Lead duplicado, obteniendo existente', { email: lead.email });
            const existing = await getLeadByEmail(lead.email);
            if (existing.success && existing.data) {
              return ok(existing.data);
            }
          }
          throw mapPostgresError(error);
        }
        throw error;
      } finally {
        client.release();
      }
    },
    {
      maxRetries: 3,
      operationName: 'createLead'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error creando lead', {
      error: error instanceof Error ? error.message : String(error),
      leadId: lead.id
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

/**
 * Obtener lead por email
 */
export async function getLeadByEmail(email: string): Promise<Result<Lead | null, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        const result = await client.query(
          'SELECT * FROM crm_leads WHERE email = $1 LIMIT 1',
          [email]
        );

        if (result.rows.length === 0) {
          return ok(null);
        }

        const row = result.rows[0];
        return ok({
          ...row,
          enrichment_data: typeof row.enrichment_data === 'string' ? JSON.parse(row.enrichment_data) : row.enrichment_data,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        } as Lead);
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
      operationName: 'getLeadByEmail'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error obteniendo lead por email', {
      error: error instanceof Error ? error.message : String(error),
      email
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

/**
 * Obtener lead por ID
 */
export async function getLeadById(id: string): Promise<Result<Lead | null, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        const result = await client.query('SELECT * FROM crm_leads WHERE id = $1 LIMIT 1', [id]);

        if (result.rows.length === 0) {
          return ok(null);
        }

        const row = result.rows[0];
        return ok({
          ...row,
          enrichment_data: typeof row.enrichment_data === 'string' ? JSON.parse(row.enrichment_data) : row.enrichment_data,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        } as Lead);
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
      operationName: 'getLeadById'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error obteniendo lead por ID', {
      error: error instanceof Error ? error.message : String(error),
      leadId: id
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

/**
 * Listar leads con paginación
 */
export async function listLeads(filters: {
  department?: 'cmo' | 'cso';
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Result<{ leads: Lead[]; total: number; hasMore: boolean }, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        const limit = filters.limit ?? 50;
        const offset = filters.offset ?? 0;

        // Query con filtros
        let query = 'SELECT * FROM crm_leads WHERE 1=1';
        const params: unknown[] = [];
        let paramIndex = 1;

        if (filters.department) {
          query += ` AND department = $${paramIndex}`;
          params.push(filters.department);
          paramIndex++;
        }

        if (filters.status) {
          query += ` AND status = $${paramIndex}`;
          params.push(filters.status);
          paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const leadsResult = await client.query(query, params);

        // Count total (optimizado)
        let countQuery = 'SELECT COUNT(*) as count FROM crm_leads WHERE 1=1';
        const countParams: unknown[] = [];
        let countParamIndex = 1;

        if (filters.department) {
          countQuery += ` AND department = $${countParamIndex}`;
          countParams.push(filters.department);
          countParamIndex++;
        }

        if (filters.status) {
          countQuery += ` AND status = $${countParamIndex}`;
          countParams.push(filters.status);
          countParamIndex++;
        }

        const countResult = await client.query(countQuery, countParams);
        const total = Number.parseInt(countResult.rows[0].count, 10);
        const hasMore = offset + limit < total;

        const leads = leadsResult.rows.map((row: {
          id: string;
          email: string;
          nombre: string;
          empresa?: string | null;
          telefono?: string | null;
          cargo?: string | null;
          score: number;
          status: string;
          department: string;
          source_channel?: string | null;
          source_method: string;
          assigned_agent?: string | null;
          enrichment_data: string | Record<string, unknown>;
          created_at: Date | string;
          updated_at: Date | string;
        }) => ({
          ...row,
          empresa: row.empresa ?? undefined,
          telefono: row.telefono ?? undefined,
          cargo: row.cargo ?? undefined,
          source_channel: row.source_channel ?? undefined,
          assigned_agent: row.assigned_agent ?? undefined,
          enrichment_data: typeof row.enrichment_data === 'string' ? JSON.parse(row.enrichment_data) : row.enrichment_data,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        })) as Lead[];

        return ok({ leads, total, hasMore });
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
      operationName: 'listLeads'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error listando leads', {
      error: error instanceof Error ? error.message : String(error),
      filters
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

/**
 * Actualizar lead existente
 */
export async function updateLead(
  leadId: string,
  updates: Partial<Pick<Lead, 'score' | 'status' | 'assigned_agent' | 'enrichment_data'>>
): Promise<Result<Lead, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        // Construir query dinámico
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        if (updates.score !== undefined) {
          fields.push(`score = $${paramIndex}`);
          values.push(updates.score);
          paramIndex++;
        }

        if (updates.status !== undefined) {
          fields.push(`status = $${paramIndex}`);
          values.push(updates.status);
          paramIndex++;
        }

        if (updates.assigned_agent !== undefined) {
          fields.push(`assigned_agent = $${paramIndex}`);
          values.push(updates.assigned_agent);
          paramIndex++;
        }

        if (updates.enrichment_data !== undefined) {
          fields.push(`enrichment_data = $${paramIndex}`);
          values.push(JSON.stringify(updates.enrichment_data));
          paramIndex++;
        }

        // Siempre actualizar updated_at
        fields.push(`updated_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;

        if (fields.length === 1) {
          // Solo updated_at, no hay nada que actualizar
          const existing = await getLeadById(leadId);
          if (!existing.success || !existing.data) {
            return err(new Error('Lead no encontrado'));
          }
          return ok(existing.data);
        }

        values.push(leadId); // Para el WHERE

        const query = `UPDATE crm_leads SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await client.query(query, values);

        if (result.rows.length === 0) {
          return err(new Error('Lead no encontrado'));
        }

        const row = result.rows[0];
        return ok({
          ...row,
          enrichment_data: typeof row.enrichment_data === 'string' ? JSON.parse(row.enrichment_data) : row.enrichment_data,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        } as Lead);
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
      operationName: 'updateLead'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error actualizando lead', {
      error: error instanceof Error ? error.message : String(error),
      leadId
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

