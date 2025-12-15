/**
 * Tests unitarios para Logger
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { logger, setCorrelationContext, getCorrelationContext } from '../logger';

// Mock de winston
jest.mock('winston', () => {
  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn()
  };

  return {
    createLogger: jest.fn().mockReturnValue(mockLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      errors: jest.fn(),
      splat: jest.fn(),
      json: jest.fn(),
      colorize: jest.fn(),
      printf: jest.fn()
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  };
});

// Mock de Application Insights
jest.mock('../../infra/observability/applicationInsights', () => ({
  getTelemetryClient: jest.fn().mockReturnValue(null),
  trackTrace: jest.fn(),
  trackException: jest.fn()
}));

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setCorrelationContext({});
  });

  describe('logger methods', () => {
    it('debería loggear error con metadata', () => {
      logger.error('Test error', { key: 'value' });

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.error).toHaveBeenCalledWith('Test error', expect.objectContaining({ key: 'value' }));
    });

    it('debería loggear warn con metadata', () => {
      logger.warn('Test warn', { key: 'value' });

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.warn).toHaveBeenCalledWith('Test warn', expect.objectContaining({ key: 'value' }));
    });

    it('debería loggear info con metadata', () => {
      logger.info('Test info', { key: 'value' });

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.info).toHaveBeenCalledWith('Test info', expect.objectContaining({ key: 'value' }));
    });

    it('debería loggear debug con metadata', () => {
      logger.debug('Test debug', { key: 'value' });

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.debug).toHaveBeenCalledWith('Test debug', expect.objectContaining({ key: 'value' }));
    });

    it('debería loggear verbose con metadata', () => {
      logger.verbose('Test verbose', { key: 'value' });

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.verbose).toHaveBeenCalledWith('Test verbose', expect.objectContaining({ key: 'value' }));
    });
  });

  describe('correlation context', () => {
    it('debería enriquecer logs con correlation ID', () => {
      setCorrelationContext({ correlationId: 'test-correlation-id' });
      logger.info('Test message');

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({ correlationId: 'test-correlation-id' })
      );
    });

    it('debería enriquecer logs con tenant ID', () => {
      setCorrelationContext({ tenantId: 'test-tenant-id' });
      logger.info('Test message');

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({ tenantId: 'test-tenant-id' })
      );
    });

    it('debería enriquecer logs con user ID', () => {
      setCorrelationContext({ userId: 'test-user-id' });
      logger.info('Test message');

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({ userId: 'test-user-id' })
      );
    });

    it('debería combinar correlation context con metadata', () => {
      setCorrelationContext({
        correlationId: 'test-correlation-id',
        tenantId: 'test-tenant-id',
        userId: 'test-user-id'
      });
      logger.info('Test message', { customKey: 'customValue' });

      const winston = require('winston');
      const mockLogger = winston.createLogger();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          tenantId: 'test-tenant-id',
          userId: 'test-user-id',
          customKey: 'customValue'
        })
      );
    });

    it('debería obtener correlation context', () => {
      setCorrelationContext({
        correlationId: 'test-correlation-id',
        tenantId: 'test-tenant-id'
      });

      const context = getCorrelationContext();
      expect(context).toEqual({
        correlationId: 'test-correlation-id',
        tenantId: 'test-tenant-id'
      });
    });
  });
});

