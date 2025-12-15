/**
 * ECONEURA - Service Registrations
 * Registro de todos los servicios en el DI Container
 */
import { getContainer } from './container';
import { getSecretsManager } from '../secrets';
import { initializeRedis, getRedisClient } from '../cache/redisClient';
import { GCPStorageAdapter } from '../storage/GCPStorageAdapter';
import { InMemoryDocumentStore } from '../../knowledge/infra/inMemoryDocumentStore';
import { InMemoryDocumentChunkStore } from '../../knowledge/infra/inMemoryDocumentChunkStore';
import { StubDocumentProcessor } from '../../knowledge/infra/stubDocumentProcessor';
import { PostgresEventStore } from '../persistence/PostgresEventStore';
import { PostgresConversationStore } from '../persistence/PostgresConversationStore';
import { InMemoryEventStore } from '../persistence/InMemoryEventStore';
import { InMemoryConversationStore } from '../persistence/InMemoryConversationStore';
import { logger } from '../../shared/logger';

/**
 * Tokens de servicios (para type-safe resolution)
 */
export const ServiceTokens = {
  // Secrets
  SecretsManager: Symbol('SecretsManager'),

  // Cache
  RedisClient: Symbol('RedisClient'),

  // Storage
  StorageService: Symbol('StorageService'),

  // Knowledge Domain
  DocumentStore: Symbol('DocumentStore'),
  DocumentChunkStore: Symbol('DocumentChunkStore'),
  DocumentProcessor: Symbol('DocumentProcessor'),

  // Persistence
  EventStore: Symbol('EventStore'),

  // Conversation
  ConversationStore: Symbol('ConversationStore')
} as const;

/**
 * Registrar todos los servicios
 */
export function registerServices(): void {
  const container = getContainer();

  // Secrets Manager (singleton)
  container.registerSingleton(ServiceTokens.SecretsManager, () => {
    return getSecretsManager();
  });

  // Redis Client (singleton)
  container.registerSingleton(ServiceTokens.RedisClient, () => {
    if (!process.env['REDIS_URL'] && process.env['USE_MEMORY_STORE'] !== 'true') {
      logger.warn('[DI] REDIS_URL missing in Real Mode. Rate limiting might fall back to memory.');
    }
    initializeRedis();
    const client = getRedisClient();
    if (!client) {
      throw new Error('Redis client not available');
    }
    return client;
  });

  // Storage Service (singleton)
  container.registerSingleton(ServiceTokens.StorageService, () => {
    return new GCPStorageAdapter();
  });

  // Document Store (singleton)
  container.registerSingleton(ServiceTokens.DocumentStore, () => {
    return new InMemoryDocumentStore();
  });

  // Document Chunk Store (singleton)
  container.registerSingleton(ServiceTokens.DocumentChunkStore, () => {
    return new InMemoryDocumentChunkStore();
  });

  // Document Processor (singleton)
  container.registerSingleton(ServiceTokens.DocumentProcessor, () => {
    return new StubDocumentProcessor();
  });

  // Event Store (singleton)
  container.registerSingleton(ServiceTokens.EventStore, () => {
    if (process.env['USE_MEMORY_STORE'] === 'true') {
      logger.warn('[DI] Using InMemoryEventStore');
      return new InMemoryEventStore();
    }
    return new PostgresEventStore();
  });

  // Conversation Store (singleton)
  container.registerSingleton(ServiceTokens.ConversationStore, () => {
    const useMemory = process.env['USE_MEMORY_STORE'] === 'true';
    const isProduction = process.env['NODE_ENV'] === 'production';

    if (useMemory) {
      if (isProduction) {
        throw new Error('CRITICAL: Cannot use InMemoryConversationStore in production environment. Set USE_MEMORY_STORE=false.');
      }
      logger.warn('[DI] Using InMemoryConversationStore (Development Mode)');
      return new InMemoryConversationStore();
    }

    if (!process.env['DATABASE_URL']) {
      throw new Error('CRITICAL: DATABASE_URL is missing. Cannot start in Real Mode. Set USE_MEMORY_STORE=true for Toy Mode.');
    }

    logger.info('[DI] Using PostgresConversationStore');
    return new PostgresConversationStore();
  });

  // Gemini Adapter (singleton)
  // Aunque getLLMClient usa el singleton exportado, lo registramos aquí para completitud
  container.registerSingleton('GeminiClient', () => {
    const { getGeminiAdapter } = require('../llm/GeminiRestAdapter');
    return getGeminiAdapter();
  });
}

/**
 * Inicializar servicios (llamar al arrancar la aplicación)
 */
export function initializeServices(): void {
  registerServices();
  logger.info('[DI] Servicios registrados correctamente');
}

