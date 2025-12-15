/**
 * Integration Test: Complete Conversation Flow
 * Test: iniciar conversación → enviar mensaje → obtener historial
 */
import request from 'supertest';
import { createServer } from '../../src/api/http/server';

import { describe, it, expect, beforeAll } from '@jest/globals';
import type { Express } from 'express';

describe('Conversation Flow Integration', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createServer();
  });

  it('should complete full conversation flow', async () => {
    // 1. Iniciar conversación
    const startResponse = await request(app)
      .post('/api/conversations')
      .set('Authorization', 'Bearer mock-token')
      .send({
        neuraId: 'a-ceo-01',
        userId: 'test-user-123'
      });

    expect(startResponse.status).toBe(201);
    expect(startResponse.body.success).toBe(true);
    expect(startResponse.body.conversation).toBeDefined();
    expect(startResponse.body.conversation.id).toBeDefined();

    const conversationId = startResponse.body.conversation.id;

    // 2. Añadir mensaje
    const appendResponse = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', 'Bearer mock-token')
      .send({
        role: 'user',
        content: 'Hola, ¿cómo estás?'
      });

    expect(appendResponse.status).toBe(201);
    expect(appendResponse.body.success).toBe(true);
    expect(appendResponse.body.message).toBeDefined();

    // 3. Obtener historial
    const historyResponse = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', 'Bearer mock-token');

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.success).toBe(true);
    expect(historyResponse.body.messages).toBeDefined();
    expect(Array.isArray(historyResponse.body.messages)).toBe(true);
    expect(historyResponse.body.messages.length).toBeGreaterThan(0);
  });

  it('should handle invalid conversation ID', async () => {
    const response = await request(app)
      .get('/api/conversations/invalid-id/messages')
      .set('Authorization', 'Bearer mock-token');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});

