import request from 'supertest';
import express from 'express';
import healthRouter from '../routes/health';

const app = express();
app.use(healthRouter);

describe('Health Endpoints', () => {
    describe('GET /health', () => {
        it('should return 200 and health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });

    describe('GET /ready', () => {
        it('should return 200 and readiness status', async () => {
            const response = await request(app).get('/ready');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ready');
            expect(response.body).toHaveProperty('checks');
        });
    });
});
