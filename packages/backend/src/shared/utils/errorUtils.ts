/**
 * ECONEURA - Error Utilities
 * Utilidades centralizadas para manejo de errores y evitar duplicación
 */

import { logger } from '../logger';
import type { Result } from '../Result';

/**
 * Tipo de error de aplicación estándar
 */
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Crear error de aplicación con código y detalles
 */
export function createAppError(
  message: string,
  options?: {
    code?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
    cause?: Error;
  }
): AppError {
  const error = new Error(message) as AppError;
  if (options?.code) error.code = options.code;
  if (options?.statusCode) error.statusCode = options.statusCode;
  if (options?.details) error.details = options.details;
  if (options?.cause) error.cause = options.cause;
  return error;
}

/**
 * Mapear error desconocido a AppError
 */
export function mapToAppError(error: unknown, defaultMessage = 'Error desconocido'): AppError {
  if (error instanceof Error) {
    return error as AppError;
  }
  return createAppError(defaultMessage, {
    details: { originalError: String(error) }
  });
}

/**
 * Loggear error de forma consistente
 */
export function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
): void {
  const appError = mapToAppError(error);
  logger.error(`[${context}] ${appError.message}`, {
    error: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    details: appError.details,
    stack: appError.stack,
    ...metadata
  });
}

/**
 * Convertir Result a error HTTP response
 * 
 * @param result - Result con error
 * @param defaultStatusCode - Status code por defecto si no está en el error
 * @returns Objeto con statusCode, message, code y details para respuesta HTTP
 */
export function resultToHttpError<T>(result: Result<T, Error>, defaultStatusCode = 500): {
  statusCode: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
} {
  if (result.success) {
    throw new Error('resultToHttpError called with successful result');
  }

  const error = result.error;
  const appError = mapToAppError(error);

  return {
    statusCode: appError.statusCode ?? defaultStatusCode,
    message: appError.message,
    code: appError.code,
    details: appError.details
  };
}

/**
 * Manejar error de forma segura y retornar Result
 * 
 * @param fn - Función async a ejecutar
 * @param errorMessage - Mensaje de error por defecto
 * @returns Result con éxito o error
 * 
 * @example
 * ```typescript
 * const result = await safeExecute(
 *   async () => await someAsyncOperation(),
 *   'Error ejecutando operación'
 * );
 * 
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorMessage = 'Error ejecutando operación'
): Promise<Result<T, Error>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const appError = mapToAppError(error, errorMessage);
    return { success: false, error: appError };
  }
}

