/**
 * ECONEURA - PostgreSQL Error Mapper
 * 
 * Mapea errores de PostgreSQL a mensajes claros y códigos HTTP apropiados.
 * Mejora UX y debugging.
 */

import { AppError } from './errorHandler';
import { logger } from '../logger';

/**
 * Mapear error de PostgreSQL a AppError
 */
export function mapPostgresError(error: unknown): AppError {
  if (!(error instanceof Error)) {
    return new AppError('Error de base de datos desconocido', 500, 'DATABASE_ERROR');
  }

  const pgError = error as Error & {
    code?: string;
    constraint?: string;
    detail?: string;
    table?: string;
    column?: string;
    severity?: string;
  };
  const pgCode = pgError.code;

  if (!pgCode || typeof pgCode !== 'string') {
    logger.warn('[PostgresErrorMapper] Error sin código PostgreSQL', {
      error: error.message,
      stack: error.stack
    });
    return new AppError('Error de base de datos', 500, 'DATABASE_ERROR');
  }

  switch (pgCode) {
    case '23505': // Unique violation
      return new AppError(
        'Ya existe un registro con estos datos',
        409,
        'DUPLICATE_ENTRY',
        {
          constraint: pgError.constraint,
          detail: pgError.detail
        }
      );

    case '23503': // Foreign key violation
      return new AppError(
        'Referencia a registro inexistente',
        400,
        'FOREIGN_KEY_VIOLATION',
        {
          constraint: pgError.constraint,
          detail: pgError.detail
        }
      );

    case '23502': // Not null violation
      return new AppError(
        'Campo requerido faltante',
        400,
        'NOT_NULL_VIOLATION',
        {
          column: pgError.column,
          detail: pgError.detail
        }
      );

    case '23514': // Check violation
      return new AppError(
        'Datos no cumplen restricciones de validación',
        400,
        'CHECK_VIOLATION',
        {
          constraint: pgError.constraint,
          detail: pgError.detail
        }
      );

    case '40P01': // Deadlock
      logger.warn('[PostgresErrorMapper] Deadlock detectado', {
        detail: pgError.detail
      });
      return new AppError(
        'Conflicto de transacciones, por favor reintentar',
        409,
        'DEADLOCK'
      );

    case '40001': // Serialization failure
      logger.warn('[PostgresErrorMapper] Serialization failure', {
        detail: pgError.detail
      });
      return new AppError(
        'Conflicto de transacciones, por favor reintentar',
        409,
        'SERIALIZATION_FAILURE'
      );

    case '42P01': // Undefined table
      logger.error('[PostgresErrorMapper] Tabla no existe', {
        detail: pgError.detail
      });
      return new AppError(
        'Error de configuración de base de datos',
        500,
        'UNDEFINED_TABLE'
      );

    case '42703': // Undefined column
      logger.error('[PostgresErrorMapper] Columna no existe', {
        detail: pgError.detail
      });
      return new AppError(
        'Error de configuración de base de datos',
        500,
        'UNDEFINED_COLUMN'
      );

    case '08003': // Connection does not exist
    case '08006': // Connection failure
    case '08001': // SQL client unable to establish SQL connection
      logger.error('[PostgresErrorMapper] Error de conexión', {
        code: pgCode,
        detail: pgError.detail
      });
      return new AppError(
        'Error de conexión a base de datos, por favor reintentar',
        503,
        'DATABASE_CONNECTION_ERROR'
      );

    case '53300': // Too many connections
      logger.error('[PostgresErrorMapper] Demasiadas conexiones', {
        detail: pgError.detail
      });
      return new AppError(
        'Base de datos sobrecargada, por favor reintentar más tarde',
        503,
        'TOO_MANY_CONNECTIONS'
      );

    default:
      logger.warn('[PostgresErrorMapper] Error PostgreSQL no mapeado', {
        code: pgCode,
        message: error.message,
        detail: pgError.detail
      });
      return new AppError(
        `Error de base de datos: ${error.message}`,
        500,
        'DATABASE_ERROR',
        {
          pgCode,
          detail: pgError.detail
        }
      );
  }
}

/**
 * Tipo para errores de PostgreSQL
 */
interface PostgresError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  table?: string;
  column?: string;
  severity?: string;
}

/**
 * Type guard para verificar si un error es de PostgreSQL
 */
function isPostgresErrorType(error: unknown): error is PostgresError {
  return error instanceof Error && 'code' in error;
}

/**
 * Verificar si un error es de PostgreSQL
 */
export function isPostgresError(error: unknown): boolean {
  if (!isPostgresErrorType(error)) {
    return false;
  }

  return typeof error.code === 'string' && error.code.length === 5;
}

