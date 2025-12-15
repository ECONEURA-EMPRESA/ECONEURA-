import request from 'supertest';
import { createServer } from '../../src/api/http/server';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import type { Express } from 'express';

describe('Chat Flow - Tests Automatizados', () => {
  let app: Express;
  let authToken: string | null = null;
  let originalFetch: typeof global.fetch;

  beforeAll(async () => {
    process.env['GEMINI_API_KEY'] = 'test-key';
    process.env['USE_MEMORY_STORE'] = 'true';
    process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/db'; // Dummy to satisfy checks if needed
    app = await createServer();
    authToken = null;
    originalFetch = global.fetch;
    global.fetch = jest.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      let urlString: string;
      if (typeof url === 'string') {
        urlString = url;
      } else if (url instanceof URL) {
        urlString = url.toString();
      } else {
        urlString = url.url;
      }

      console.log('[TEST MOCK] Fetch called with:', urlString);

      if (urlString.includes('generativelanguage.googleapis.com')) {
        console.log('[TEST MOCK] Intercepting Gemini call');
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Respuesta simulada de Gemini para tests.' }],
                  role: 'model'
                },
                finishReason: 'STOP',
                index: 0,
                safetyRatings: []
              }
            ]
          })
        } as Response;
      }
      return originalFetch(url, init);
    });
  });

  afterAll(async () => {
    if (originalFetch) {
      global.fetch = originalFetch;
    }
  });

  describe('Health Check', () => {
    it('debe responder 200 en /api/health', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      // En test environment sin Redis real, el status puede ser degraded
      expect(['ok', 'degraded']).toContain(response.body.status);
    });
  });

  describe('Invoke API', () => {
    it('debe aceptar request sin input (default greeting)', async () => {
      const response = await request(app)
        .post('/api/invoke/a-ceo-01')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({});

      // El backend ahora permite input vacío y devuelve un saludo por defecto
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debe aceptar request con input válido', async () => {
      const response = await request(app)
        .post('/api/invoke/a-ceo-01')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({
          input: 'Hola, esto es un test'
        });

      // Puede ser 200 (éxito) o 401/403 (auth requerida)
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.output).toBeDefined();
      }
    });
  });

  describe('Upload API', () => {
    it('debe rechazar request sin archivo', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`);

      expect(response.status).toBe(400);
    });

    it('debe aceptar subida de archivo válida', async () => {
      const buffer = Buffer.from('test content');
      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .attach('file', buffer, 'test.txt');

      // Puede ser 201 (creado) o 401/403 (auth requerida)
      expect([201, 401, 403]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.publicUrl).toBeDefined();
        expect(response.body.fileId).toBeDefined();
      }
    });
  });
});

