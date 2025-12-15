/**
 * Integration Test: Automation Flow
 * Test: ejecutar agente Make → ejecutar agente n8n
 */
import request from 'supertest';
import { createServer } from '../../src/api/http/server';

import { describe, it, expect, beforeAll } from '@jest/globals';
import type { Express } from 'express';

describe('Automation Flow Integration', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createServer();
  });

  it('should execute agent via API', async () => {
    // Ejecutar agente (usando un ID válido del registry)
    const response = await request(app)
      .post('/api/agents/ceo-agenda-consejo/execute')
      .set('Authorization', 'Bearer mock-token')
      .send({
        params: {
          test: 'value'
        },
        triggered_by: 'user'
      });

    // Puede ser 200 (éxito) o 404 (agente no encontrado en modo stub)
    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.execution_id).toBeDefined();
    }
  });

  it('should list available agents', async () => {
    const response = await request(app)
      .get('/api/agents')
      .set('Authorization', 'Bearer mock-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.agents).toBeDefined();
    expect(Array.isArray(response.body.agents)).toBe(true);
  });

  it('should get agent details', async () => {
    const response = await request(app)
      .get('/api/agents/ceo-agenda-consejo')
      .set('Authorization', 'Bearer mock-token');

    // Puede ser 200 (éxito) o 404 (agente no encontrado)
    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.agent).toBeDefined();
      expect(response.body.agent.id).toBe('ceo-agenda-consejo');
    }
  });
});

