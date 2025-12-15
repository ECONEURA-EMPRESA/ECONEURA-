import { getPostgresPool } from './postgresPool';
import { logger } from '../../shared/logger';
import type { DomainEvent, EventStore } from './EventStore';

export class PostgresEventStore implements EventStore {
    async appendEvents(
        aggregateId: string,
        events: DomainEvent[],
        _expectedVersion?: number
    ): Promise<void> {
        const pool = getPostgresPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // (Opcional) Verificación de concurrencia optimista si expectedVersion está definido
            // Por simplicidad en este paso, insertamos directamente.

            for (const event of events) {
                await client.query(
                    `INSERT INTO domain_events (aggregate_id, type, payload, timestamp)
           VALUES ($1, $2, $3, $4)`,
                    [
                        aggregateId,
                        event.type,
                        JSON.stringify(event.payload),
                        event.timestamp
                    ]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('[PostgresEventStore] Error appending events', {
                error: error instanceof Error ? error.message : String(error),
                aggregateId
            });
            throw error;
        } finally {
            client.release();
        }
    }

    async loadEvents(aggregateId: string): Promise<DomainEvent[]> {
        const pool = getPostgresPool();
        try {
            const result = await pool.query(
                `SELECT type, aggregate_id, timestamp, payload
         FROM domain_events
         WHERE aggregate_id = $1
         ORDER BY timestamp ASC`,
                [aggregateId]
            );

            return result.rows.map(row => ({
                type: row.type,
                aggregateId: row.aggregate_id,
                timestamp: row.timestamp,
                payload: row.payload // pg parsea JSON automáticamente
            }));
        } catch (error) {
            logger.error('[PostgresEventStore] Error loading events', {
                error: error instanceof Error ? error.message : String(error),
                aggregateId
            });
            throw error;
        }
    }
}
