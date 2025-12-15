import { getPostgresPool } from './postgresPool';
import { logger } from '../../shared/logger';

export async function initDatabase(): Promise<void> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    logger.info('[InitDB] Verificando tablas de base de datos...');

    // Tabla Conversations
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255),
        neura_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Tabla Messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id),
        tenant_id VARCHAR(255),
        neura_id VARCHAR(255),
        user_id VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        correlation_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Índices para Messages
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);

    // Tabla Domain Events (Event Sourcing)
    await client.query(`
      CREATE TABLE IF NOT EXISTS domain_events (
        id SERIAL PRIMARY KEY,
        aggregate_id VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        payload JSONB NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        version INTEGER
      );
    `);

    // Índices para Domain Events
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate_id ON domain_events(aggregate_id);
    `);

    logger.info('[InitDB] Tablas verificadas/creadas correctamente');
  } catch (error) {
    logger.error('[InitDB] Error inicializando base de datos', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  } finally {
    client.release();
  }
}
