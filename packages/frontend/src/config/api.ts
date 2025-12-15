/**
 * ECONEURA - API Configuration
 * Centralized API URL and correlation ID generation
 */

const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it.
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In production (or if no env var), default to relative path to leverage proxy/rewrites
  if (import.meta.env.PROD) {
    return '/api';
  }

  // Local development default
  return 'http://localhost:3000/api';
};

export const API_URL = getApiUrl();

export function generateCorrelationId(prefix = 'web'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

