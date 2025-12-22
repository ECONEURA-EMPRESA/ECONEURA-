/**
 * ECONEURA - API Configuration
 * Centralized API URL and correlation ID generation
 */

// Google Cloud Native: Use relative path in production to leverage Firebase rewrites
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export function generateCorrelationId(prefix = 'web'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

