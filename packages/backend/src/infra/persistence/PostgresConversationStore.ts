import { type ConversationStore } from '../../conversation/store/inMemoryConversationStore';
import { type Conversation } from '../../conversation/Conversation';
import { type Message } from '../../conversation/Message';
import { getPostgresPool } from './postgresPool';
import { logger } from '../../shared/logger';

export class PostgresConversationStore implements ConversationStore {
    async createConversation(conversation: Conversation): Promise<void> {
        const pool = getPostgresPool();
        try {
            await pool.query(
                `INSERT INTO conversations (id, tenant_id, neura_id, user_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    conversation.id,
                    conversation.tenantId,
                    conversation.neuraId,
                    conversation.userId,
                    conversation.createdAt,
                    conversation.updatedAt
                ]
            );
        } catch (error) {
            logger.error('[PostgresConversationStore] Error creating conversation', {
                error: error instanceof Error ? error.message : String(error),
                conversationId: conversation.id
            });
            throw error;
        }
    }

    async appendMessage(message: Message): Promise<void> {
        const pool = getPostgresPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Insertar mensaje
            await client.query(
                `INSERT INTO messages (id, conversation_id, tenant_id, neura_id, user_id, role, content, correlation_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    message.id,
                    message.conversationId,
                    message.tenantId,
                    message.neuraId,
                    message.userId,
                    message.role,
                    message.content,
                    message.correlationId,
                    message.createdAt
                ]
            );

            // Actualizar timestamp de conversación
            await client.query(
                `UPDATE conversations SET updated_at = $1 WHERE id = $2`,
                [message.createdAt, message.conversationId]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('[PostgresConversationStore] Error appending message', {
                error: error instanceof Error ? error.message : String(error),
                messageId: message.id
            });
            throw error;
        } finally {
            client.release();
        }
    }

    async getConversation(id: string): Promise<Conversation | null> {
        const pool = getPostgresPool();
        try {
            const result = await pool.query(
                `SELECT id, tenant_id, neura_id, user_id, created_at, updated_at FROM conversations WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return {
                id: row.id,
                tenantId: row.tenant_id,
                neuraId: row.neura_id,
                userId: row.user_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
        } catch (error) {
            logger.error('[PostgresConversationStore] Error getting conversation', {
                error: error instanceof Error ? error.message : String(error),
                conversationId: id
            });
            throw error;
        }
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        const pool = getPostgresPool();
        try {
            const result = await pool.query(
                `SELECT id, conversation_id, tenant_id, neura_id, user_id, role, content, correlation_id, created_at
         FROM messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
                [conversationId]
            );

            return result.rows.map(row => ({
                id: row.id,
                conversationId: row.conversation_id,
                tenantId: row.tenant_id,
                neuraId: row.neura_id,
                userId: row.user_id,
                role: row.role,
                content: row.content,
                correlationId: row.correlation_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            logger.error('[PostgresConversationStore] Error getting messages', {
                error: error instanceof Error ? error.message : String(error),
                conversationId
            });
            throw error;
        }
    }
}
