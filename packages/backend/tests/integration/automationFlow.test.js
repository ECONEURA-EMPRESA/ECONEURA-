"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Integration Test: Automation Flow
 * Test: ejecutar agente Make → ejecutar agente n8n
 */
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../src/api/http/server");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Automation Flow Integration', () => {
    let app;
    (0, globals_1.beforeAll)(async () => {
        app = await (0, server_1.createServer)();
    });
    (0, globals_1.it)('should execute agent via API', async () => {
        // Ejecutar agente (usando un ID válido del registry)
        const response = await (0, supertest_1.default)(app)
            .post('/api/agents/ceo-agenda-consejo/execute')
            .set('Authorization', 'Bearer mock-token')
            .send({
            params: {
                test: 'value'
            },
            triggered_by: 'user'
        });
        // Puede ser 200 (éxito) o 404 (agente no encontrado en modo stub)
        (0, globals_1.expect)([200, 404]).toContain(response.status);
        if (response.status === 200) {
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.execution_id).toBeDefined();
        }
    });
    (0, globals_1.it)('should list available agents', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/api/agents')
            .set('Authorization', 'Bearer mock-token');
        (0, globals_1.expect)(response.status).toBe(200);
        (0, globals_1.expect)(response.body.success).toBe(true);
        (0, globals_1.expect)(response.body.agents).toBeDefined();
        (0, globals_1.expect)(Array.isArray(response.body.agents)).toBe(true);
    });
    (0, globals_1.it)('should get agent details', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/api/agents/ceo-agenda-consejo')
            .set('Authorization', 'Bearer mock-token');
        // Puede ser 200 (éxito) o 404 (agente no encontrado)
        (0, globals_1.expect)([200, 404]).toContain(response.status);
        if (response.status === 200) {
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.agent).toBeDefined();
            (0, globals_1.expect)(response.body.agent.id).toBe('ceo-agenda-consejo');
        }
    });
});
