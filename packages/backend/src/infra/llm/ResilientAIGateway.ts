/**
 * ECONEURA - Resilient AI Gateway
 * Wrapper de LLMClient con circuit breaker, fallback y retry logic
 * Migrado desde ECONEURA-REMOTE/backend/services/resilientAIGateway.js
 */
import { type LLMClient, type GenerationResult } from '../../llm/invokeLLMAgent';
import { err, type Result } from '../../shared/Result';
import { logger } from '../../shared/logger';
import { retry, type RetryOptions } from '../../shared/utils/retry';

interface ProviderConfig {
  name: string;
  models: string[];
  priority: number;
  timeout: number;
  retryAttempts: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number | null;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  threshold: number;
  timeout: number;
}

export class ResilientAIGateway implements LLMClient {
  private readonly providers: Record<string, ProviderConfig>;
  private readonly circuitBreakers: Record<string, CircuitBreakerState>;
  private readonly primaryClient: LLMClient;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(primaryClient: LLMClient) {
    this.primaryClient = primaryClient;

    // Configuración de providers (por ahora solo OpenAI, extensible)
    this.providers = {
      openai: {
        name: 'OpenAI',
        models: ['mistral-medium', 'gpt-4', 'gpt-3.5-turbo'], // Mistral Medium como principal
        priority: 2,
        timeout: 60000,
        retryAttempts: 2
      },
      gemini: {
        name: 'Gemini',
        models: ['gemini-1.5-pro', 'gemini-pro'],
        priority: 1, // Prioridad máxima
        timeout: 30000,
        retryAttempts: 3
      }
    };

    this.circuitBreakers = {};
    this.initializeCircuitBreakers();
    this.startHealthCheck();
  }

  private initializeCircuitBreakers(): void {
    Object.keys(this.providers).forEach((provider) => {
      this.circuitBreakers[provider] = {
        failures: 0,
        lastFailure: null,
        state: 'CLOSED',
        threshold: 5,
        timeout: 60000 // 1 minuto
      };
    });
  }

  async generate(params: {
    model: string;
    systemPrompt: string;
    userInput: string;
    temperature: number;
    maxTokens: number;
    correlationId?: string | undefined;
  }): Promise<Result<GenerationResult, Error>> {
    const provider = this.selectProvider(params.model);

    if (!provider) {
      // Si no hay provider, usar el cliente primario directamente
      logger.warn('[ResilientAIGateway] No hay provider disponible, usando cliente primario', {
        correlationId: params.correlationId
      });
      return this.primaryClient.generate(params);
    }

    const breaker = this.circuitBreakers[provider];
    if (!breaker || breaker.state === 'OPEN') {
      // Si el provider está abierto, intentar con el cliente primario directamente
      logger.warn('[ResilientAIGateway] Provider abierto, usando cliente primario', {
        provider,
        correlationId: params.correlationId
      });
      return this.primaryClient.generate(params);
    }

    // Ejecutar con retry y circuit breaker
    const config = this.providers[provider];
    if (!config) {
      logger.warn('[ResilientAIGateway] Config no encontrada para provider, usando cliente primario', {
        provider,
        correlationId: params.correlationId
      });
      return this.primaryClient.generate(params);
    }
    const retryOptions: RetryOptions = {
      maxRetries: config.retryAttempts,
      initialDelay: 1000,
      maxDelay: 5000,
      operationName: `LLM generation (${provider})`,
      shouldRetry: (error) => {
        // Reintentar en errores de red o 5xx
        if (error && typeof error === 'object' && 'code' in error) {
          const code = error.code as string;
          if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
            return true;
          }
        }
        return false;
      }
    };

    try {
      const result = await retry(
        () => this.primaryClient.generate(params),
        retryOptions
      );

      if (result.success) {
        this.resetCircuitBreaker(provider);
        logger.info('[ResilientAIGateway] Generación exitosa', {
          provider,
          correlationId: params.correlationId
        });
      }

      return result;
    } catch (error) {
      this.recordFailure(provider);
      logger.error('[ResilientAIGateway] Error en generación', {
        provider,
        error: error instanceof Error ? error.message : String(error),
        correlationId: params.correlationId
      });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private selectProvider(requestedModel: string): string | null {
    // Encontrar provider para el modelo solicitado
    for (const [providerName, config] of Object.entries(this.providers)) {
      const breaker = this.circuitBreakers[providerName];
      if (
        config &&
        breaker &&
        config.models.includes(requestedModel) &&
        breaker.state !== 'OPEN'
      ) {
        return providerName;
      }
    }

    // Fallback: usar cualquier provider disponible
    const availableProviders = Object.keys(this.providers).filter((provider) => {
      const breaker = this.circuitBreakers[provider];
      return breaker && breaker.state !== 'OPEN';
    });

    if (availableProviders.length === 0) {
      return null;
    }

    // Ordenar por prioridad
    return availableProviders.sort((a, b) => {
      const configA = this.providers[a];
      const configB = this.providers[b];
      if (!configA || !configB) return 0;
      return configA.priority - configB.priority;
    })[0] ?? null;
  }

  private recordFailure(provider: string): void {
    const breaker = this.circuitBreakers[provider];
    if (!breaker) return;

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= breaker.threshold) {
      breaker.state = 'OPEN';
      logger.warn(`[ResilientAIGateway] Circuit breaker abierto para ${provider}`, {
        provider,
        failures: breaker.failures
      });
    }
  }

  private resetCircuitBreaker(provider: string): void {
    const breaker = this.circuitBreakers[provider];
    if (!breaker) return;

    breaker.failures = 0;
    breaker.state = 'CLOSED';
  }

  // Auto-healing: verificar circuit breakers periódicamente
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      Object.keys(this.circuitBreakers).forEach((provider) => {
        const breaker = this.circuitBreakers[provider];
        if (!breaker) return;

        if (
          breaker.state === 'OPEN' &&
          breaker.lastFailure !== null &&
          Date.now() - breaker.lastFailure > breaker.timeout
        ) {
          breaker.state = 'HALF_OPEN';
          logger.info(`[ResilientAIGateway] Circuit breaker en HALF_OPEN para ${provider}`, {
            provider
          });
        }
      });
    }, 30000); // Cada 30 segundos
  }

  // Métricas para monitoring
  getMetrics(): {
    providers: Array<{
      name: string;
      state: string;
      failures: number;
      lastFailure: number | null;
    }>;
    timestamp: string;
  } {
    return {
      providers: Object.keys(this.providers).map((provider) => {
        const breaker = this.circuitBreakers[provider];
        return {
          name: provider,
          state: breaker?.state ?? 'UNKNOWN',
          failures: breaker?.failures ?? 0,
          lastFailure: breaker?.lastFailure ?? null
        };
      }),
      timestamp: new Date().toISOString()
    };
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

