/**
 * ECONEURA - PostgreSQL Conversation Store
 * 
 * CRÍTICO: Usa getPostgresPool() compartido.
 */

import { getPostgresPool } from '../../infra/persistence/postgresPool';
import { logger } from '../../shared/logger';
import { ok, err, type Result } from '../../shared/Result';
import { retryDatabase } from '../../shared/utils/retry';
import { mapPostgresError, isPostgresError } from '../../shared/utils/postgresErrorMapper';

export interface Conversation {
  id: string;
  lead_id: string;
  mensaje: string;
  agent_name: string;
  direction: 'inbound' | 'outbound';
  intent?: 'positivo' | 'neutro' | 'negativo';
  timestamp: Date;
}

/**
 * Crear conversación
 */
export async function createConversation(
  conversation: Conversation
): Promise<Result<Conversation, Error>> {
  return retryDatabase(
    async () => {
      const client = await getPostgresPool().connect();

      try {
        const result = await client.query(
          `INSERT INTO crm_conversations (
            id, lead_id, mensaje, agent_name, direction, intent, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            conversation.id,
            conversation.lead_id,
            conversation.mensaje,
            conversation.agent_name,
            conversation.direction,
            conversation.intent ?? null,
            conversation.timestamp
          ]
        );

        const row = result.rows[0];
        return ok({
          ...row,
          timestamp: new Date(row.timestamp)
        } as Conversation);
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
      operationName: 'createConversation'
    }
  ).catch((error: unknown) => {
    logger.error('[CRM] Error creando conversación', {
      error: error instanceof Error ? error.message : String(error)
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  });
}

