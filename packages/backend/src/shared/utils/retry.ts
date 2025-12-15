/**
 * ECONEURA - Retry Utility
 * Enterprise-grade retry logic con exponential backoff
 * Migrado desde ECONEURA-REMOTE/backend/utils/retry.js
 */
import { logger } from '../logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
  operationName?: string;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry una función con exponential backoff
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    operationName = 'operation'
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await fn();

      if (attempt > 1) {
        logger.info(`[Retry] ${operationName} succeeded`, {
          attempt,
          totalAttempts: attempt
        });
      }

      return result;
    } catch (error) {
      lastError = error;

      // Si es el último intento, lanzar error
      if (attempt > maxRetries) {
        logger.error(`[Retry] ${operationName} failed after ${maxRetries} retries`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }

      // Verificar si debemos reintentar
      if (!shouldRetry(error)) {
        logger.warn(`[Retry] ${operationName} not retryable`, {
          error: error instanceof Error ? error.message : String(error),
          attempt
        });
        throw error;
      }

      // Log retry attempt
      logger.warn(`[Retry] ${operationName} failed, retrying...`, {
        attempt,
        maxRetries,
        delay,
        error: error instanceof Error ? error.message : String(error)
      });

      // Esperar antes de reintentar
      await sleep(delay);

      // Calcular siguiente delay con exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Retry para operaciones HTTP
 */
export async function retryHttp<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retry(fn, {
    maxRetries: options.maxRetries ?? 3,
    initialDelay: options.initialDelay ?? 500,
    maxDelay: options.maxDelay ?? 5000,
    shouldRetry: (error) => {
      // Solo reintentar en errores de red o 5xx
      if (error && typeof error === 'object' && 'code' in error) {
        const code = error.code as string;
        if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
          return true;
        }
      }
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { status?: number } }).response;
        if (response?.status !== undefined && response.status >= 500) {
          return true;
        }
        // 429 Too Many Requests también es reintentar
        if (response?.status === 429) {
          return true;
        }
      }
      return false;
    },
    operationName: options.operationName ?? 'HTTP request'
  });
}

/**
 * Retry para operaciones de base de datos
 */
export async function retryDatabase<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retry(fn, {
    maxRetries: options.maxRetries ?? 5,
    initialDelay: options.initialDelay ?? 1000,
    maxDelay: options.maxDelay ?? 10000,
    shouldRetry: (error) => {
      // Reintentar en errores de conexión
      if (error && typeof error === 'object' && 'code' in error) {
        const code = error.code as string;
        if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
          return true;
        }
        // Reintentar en deadlocks
        if (code === '40P01' || (error instanceof Error && error.message.includes('deadlock'))) {
          return true;
        }
        // Reintentar en serialization failures
        if (code === '40001') {
          return true;
        }
      }
      return false;
    },
    operationName: options.operationName ?? 'Database operation'
  });
}

/**
 * Circuit Breaker simple
 */
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastFailureTime: number | null = null;
  private successCount = 0;
  private totalCount = 0;

  constructor(
    private readonly options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
      name?: string;
    } = {}
  ) {
    this.options.failureThreshold = options.failureThreshold ?? 5;
    this.options.resetTimeout = options.resetTimeout ?? 60000; // 1 minuto
    this.options.monitoringPeriod = options.monitoringPeriod ?? 10000; // 10 segundos
    this.options.name = options.name ?? 'circuit';
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Si el circuito está abierto, verificar si debemos pasar a HALF_OPEN
    if (this.state === 'OPEN') {
      if (this.lastFailureTime !== null) {
        const timeSinceLastFailure = Date.now() - this.lastFailureTime;
        if (timeSinceLastFailure >= (this.options.resetTimeout ?? 60000)) {
          logger.info(`[CircuitBreaker] ${this.options.name} transitioning to HALF_OPEN`);
          this.state = 'HALF_OPEN';
          this.successCount = 0;
        } else {
          throw new Error(`Circuit breaker ${this.options.name} is OPEN`);
        }
      } else {
        throw new Error(`Circuit breaker ${this.options.name} is OPEN`);
      }
    }

    this.totalCount++;

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.successCount++;

    // Si estábamos en HALF_OPEN y tenemos éxitos, cerrar el circuito
    if (this.state === 'HALF_OPEN' && this.successCount >= 3) {
      logger.info(`[CircuitBreaker] ${this.options.name} transitioning to CLOSED`);
      this.state = 'CLOSED';
      this.successCount = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    // Si estábamos en HALF_OPEN, volver a OPEN inmediatamente
    if (this.state === 'HALF_OPEN') {
      logger.warn(`[CircuitBreaker] ${this.options.name} transitioning to OPEN (failed in HALF_OPEN)`);
      this.state = 'OPEN';
      return;
    }

    // Si alcanzamos el umbral de fallos, abrir el circuito
    if (this.failures >= (this.options.failureThreshold ?? 5)) {
      logger.warn(`[CircuitBreaker] ${this.options.name} transitioning to OPEN`, {
        failures: this.failures,
        threshold: this.options.failureThreshold
      });
      this.state = 'OPEN';
    }
  }

  getState(): {
    state: string;
    failures: number;
    totalCount: number;
    successRate: string;
  } {
    return {
      state: this.state,
      failures: this.failures,
      totalCount: this.totalCount,
      successRate:
        this.totalCount > 0
          ? (((this.totalCount - this.failures) / this.totalCount) * 100).toFixed(2)
          : '100.00'
    };
  }
}

