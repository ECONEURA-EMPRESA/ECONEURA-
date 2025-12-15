/**
 * Health Check Routes
 * Endpoint para verificar salud del sistema (usado por Kubernetes, Azure, etc.)
 */
import type { Request, Response } from 'express';
import { getRedisClient, isRedisAvailable } from '../../../infra/cache/redisClient';
import { getPostgresPool } from '../../../infra/persistence/postgresPool';
import { logger } from '../../../shared/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error' | 'not_configured';
    [key: string]: string;
  };
  uptime: number;
}

/**
 * Health check básico (rápido)
 * GET /health
 */
export function basicHealthCheck(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

/**
 * Health check completo
 * GET /api/health
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  let overallStatus: HealthStatus['status'] = 'healthy';
  const checks: HealthStatus['checks'] = {
    database: 'ok',
    redis: 'ok'
  };

  // Check PostgreSQL
  if (process.env['USE_MEMORY_STORE'] === 'true') {
    checks.database = 'ok';
  } else {
    try {
      const pool = getPostgresPool();
      if (pool) {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
          checks.database = 'ok';
        } finally {
          client.release();
        }
      } else {
        checks.database = 'error';
        overallStatus = 'degraded';
      }
    } catch (error) {
      logger.error('[HealthCheck] Database check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      checks.database = 'error';
      overallStatus = 'unhealthy';
    }
  }

  // Check Redis
  try {
    if (isRedisAvailable()) {
      const redis = getRedisClient();
      if (redis) {
        await redis.ping();
        checks.redis = 'ok';
      } else {
        checks.redis = 'not_configured';
        // Redis no es crítico, solo degrada
        if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    } else {
      checks.redis = 'not_configured';
      // Redis no es crítico, solo degrada
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }
  } catch (error) {
    logger.error('[HealthCheck] Redis check failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    checks.redis = 'error';
    // Redis no es crítico, solo degrada
    if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    checks,
    uptime: Math.floor(process.uptime())
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
}

/**
 * Liveness probe (para Kubernetes)
 * GET /api/health/live
 */
export function livenessProbe(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
}

/**
 * Readiness probe (para Kubernetes)
 * GET /api/health/ready
 */
export async function readinessProbe(_req: Request, res: Response): Promise<void> {
  // Verificar que las dependencias críticas están disponibles
  let isReady = true;

  // Check database (crítico)
  if (process.env['USE_MEMORY_STORE'] === 'true') {
    // Skip DB check
  } else {
    try {
      const pool = getPostgresPool();
      if (pool) {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
        } finally {
          client.release();
        }
      } else {
        isReady = false;
      }
    } catch {
      isReady = false;
    }
  }

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString()
    });
  }
}
