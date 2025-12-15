/**
 * ECONEURA - PostgreSQL Pool Singleton (Cloud Native)
 * 
 * Pool compartido para todas las operaciones de base de datos.
 * Optimizado para Google Cloud SQL y Cloud Run (Unix Sockets).
 */

import { Pool, type PoolConfig } from 'pg';
import { getValidatedEnv } from '../../config/env';
import { logger } from '../../shared/logger';

let sharedPool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!sharedPool) {
    const env = getValidatedEnv();

    const poolConfig: PoolConfig = {
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Slightly increased for cold starts
    };

    // CLOUD NATIVE LOGIC:
    // If INSTANCE_CONNECTION_NAME is present (Production), use Unix Socket.
    // If NOT (Local), use TCP host/port.
    if (env.INSTANCE_CONNECTION_NAME) {
      // Cloud Run connects via /cloudsql/PROJECT:REGION:INSTANCE
      poolConfig.host = `/cloudsql/${env.INSTANCE_CONNECTION_NAME}`;
      // Port is ignored for sockets, but good practice to omit or set null to allow pg to default
    } else {
      // Local Development
      poolConfig.host = 'localhost';
      poolConfig.port = 5432;
    }

    logger.info('[PostgresPool] Inicializando pool...', {
      mode: env.INSTANCE_CONNECTION_NAME ? 'Cloud Run (Socket)' : 'Local (TCP)',
      db: env.DB_NAME
    });

    sharedPool = new Pool(poolConfig);

    sharedPool.on('error', (err) => {
      logger.error('[PostgresPool] CRITICAL: Unexpected error on idle client', {
        error: err.message,
        stack: err.stack
      });
    });
  }

  return sharedPool;
}

export async function closePostgresPool(): Promise<void> {
  if (sharedPool) {
    await sharedPool.end();
    sharedPool = null;
  }
}
