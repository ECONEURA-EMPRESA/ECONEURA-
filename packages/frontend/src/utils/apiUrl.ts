/**
 * ECONEURA - API URL Utility
 * 
 * Centraliza la construcción de URLs de API y headers de autenticación
 * para evitar duplicación de código en múltiples componentes.
 * 
 * @module utils/apiUrl
 */

/**
 * Obtener la URL base de la API según el entorno
 * 
 * @returns URL base de la API (localhost en dev, Azure en producción)
 * 
 * @example
 * ```typescript
 * const apiUrl = getApiUrl();
 * // Dev: 'http://localhost:3000'
 * // Prod: 'https://econeura-backend-production.azurewebsites.net'
 * ```
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // SSR - usar variable de entorno o default
    return process.env.VITE_API_URL || 'http://localhost:3000';
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  return isLocalhost
    ? 'http://localhost:3000'
    : 'https://econeura-backend-production.azurewebsites.net';
}

/**
 * Obtener el token de autenticación desde localStorage
 * 
 * @returns Token de autenticación o string vacío si no existe
 * 
 * @example
 * ```typescript
 * const token = getAuthToken();
 * if (token) {
 *   headers['Authorization'] = `Bearer ${token}`;
 * }
 * ```
 */
export function getAuthToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return localStorage.getItem('econeura_token') || '';
}

/**
 * Crear headers estándar para requests autenticados
 * 
 * @param additionalHeaders - Headers adicionales opcionales
 * @returns Objeto con headers estándar incluyendo Authorization si hay token
 * 
 * @example
 * ```typescript
 * const headers = createAuthHeaders({
 *   'X-Correlation-Id': correlationId(),
 *   'X-Department': 'CEO'
 * });
 * // Headers incluyen: Content-Type, Authorization (si hay token), y los adicionales
 * ```
 */
export function createAuthHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

