/**
 * Tests unitarios para Redis Client
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  initializeRedis,
  getRedisClient,
  isRedisAvailable,
  closeRedis
} from '../redisClient';

// Mock de ioredis
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRedisInstance: any = {
  on: jest.fn(),
  connect: jest.fn(() => Promise.resolve()),
  quit: jest.fn(() => Promise.resolve('OK')),
  call: jest.fn(() => Promise.resolve('OK')),
  status: 'ready'
};

jest.mock('ioredis', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jest.fn().mockImplementation(() => mockRedisInstance) as any;
});

describe('Redis Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('initializeRedis', () => {
    it('debería inicializar Redis si hay REDIS_URL', () => {
      process.env['REDIS_URL'] = 'rediss://test-redis:6380';

      const result = initializeRedis();
      expect(result).toBe(true);
    });

    it('debería retornar false si no hay REDIS_URL', () => {
      delete process.env['REDIS_URL'];

      const result = initializeRedis();
      expect(result).toBe(false);
    });

    it('debería configurar event handlers', () => {
      process.env['REDIS_URL'] = 'rediss://test-redis:6380';
      jest.clearAllMocks();

      initializeRedis();

      expect(mockRedisInstance.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedisInstance.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockRedisInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedisInstance.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('getRedisClient', () => {
    it('debería retornar cliente si está inicializado', () => {
      process.env['REDIS_URL'] = 'rediss://test-redis:6380';
      initializeRedis();

      const client = getRedisClient();
      expect(client).not.toBeNull();
    });

    it('debería retornar null si no está inicializado', () => {
      delete process.env['REDIS_URL'];
      jest.resetModules();

      const client = getRedisClient();
      expect(client).toBeNull();
    });
  });

  describe('isRedisAvailable', () => {
    it('debería retornar true si Redis está ready', () => {
      process.env['REDIS_URL'] = 'rediss://test-redis:6380';
      mockRedisInstance.status = 'ready';
      initializeRedis();

      const available = isRedisAvailable();
      expect(available).toBe(true);
    });

    it('debería retornar false si Redis no está ready', () => {
      process.env['REDIS_URL'] = 'rediss://test-redis:6380';
      mockRedisInstance.status = 'end';
      initializeRedis();

      const available = isRedisAvailable();
      expect(available).toBe(false);
    });
  });

  describe('closeRedis', () => {
    it('debería cerrar conexión Redis', async () => {
      process.env['REDIS_URL'] = 'rediss://test-redis:6380';
      jest.clearAllMocks();
      initializeRedis();

      await closeRedis();

      expect(mockRedisInstance.quit).toHaveBeenCalled();
    });

    it('no debería fallar si no hay cliente', async () => {
      delete process.env['REDIS_URL'];
      jest.resetModules();

      await expect(closeRedis()).resolves.not.toThrow();
    });
  });
});

