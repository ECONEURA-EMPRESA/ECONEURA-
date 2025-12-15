/**
 * Cache Headers Middleware
 * Control de cache por tipo de endpoint
 * Migrado desde ECONEURA-REMOTE/backend/middleware/cacheHeaders.js
 */
import type { Request, Response, NextFunction } from 'express';

export function noCacheMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
}

export function cacheMiddleware(maxAge = 3600) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
}

