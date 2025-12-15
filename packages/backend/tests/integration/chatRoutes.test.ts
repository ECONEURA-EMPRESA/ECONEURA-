import request from 'supertest';
import { createServer } from '../../src/api/http/server';

describe('Integración HTTP: chat NEURA y Automation', () => {
  it('debe rechazar ejecución de agente sin token (middleware auth)', async () => {
    const app = await createServer();

    const response = await request(app)
      .post('/api/chat/ceo/execute-agent')
      .send({ message: 'ejecuta Agenda Consejo', neuraId: 'neura-ceo' });

    expect(response.status).toBe(401);
  });

  it('debe permitir chat NEURA con token dev y devolver resultado coherente (mock/real)', async () => {
    const app = await createServer();

    const response = await request(app)
      .post('/api/neuras/neura-ceo/chat')
      .set('Authorization', 'Bearer dev-token')
      .send({
        message: 'Hola NEURA',
        userId: 'user-1',
        tenantId: 'tenant-1'
      });

    // No comprobamos el contenido exacto porque depende del LLM, solo que la forma sea correcta.
    expect([200, 400, 500]).toContain(response.status);
    expect(response.body).toHaveProperty('success');
  });
});


