import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 * Catches all errors and returns proper JSON response
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log error (in production, send to Application Insights)
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString()
    });

    // Don't leak error details in production
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(500).json({
        error: {
            message: isProduction ? 'Internal server error' : err.message,
            stack: isProduction ? undefined : err.stack,
            timestamp: new Date().toISOString()
        }
    });
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (_req: Request, res: Response) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            timestamp: new Date().toISOString()
        }
    });
};
