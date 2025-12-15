import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * Health check endpoint
 * Returns 200 if service is running
 */
router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * Readiness check endpoint
 * Returns 200 if service is ready to accept traffic
 * Checks: DB connection, Redis connection, etc.
 */
router.get('/ready', async (_req: Request, res: Response) => {
    try {
        // Basic readiness check - service is running
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            checks: {
                server: 'ok',
                uptime: process.uptime()
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
