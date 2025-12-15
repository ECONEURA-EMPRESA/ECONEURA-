"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Integration Test: Complete Conversation Flow
 * Test: iniciar conversación → enviar mensaje → obtener historial
 */
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../src/api/http/server");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Conversation Flow Integration', () => {
    let app;
    (0, globals_1.beforeAll)(async () => {
        app = await (0, server_1.createServer)();
    });
    (0, globals_1.it)('should complete full conversation flow', async () => {
        // 1. Iniciar conversación
        const startResponse = await (0, supertest_1.default)(app)
            .post('/api/conversations')
            .set('Authorization', 'Bearer mock-token')
            .send({
            neuraId: 'a-ceo-01',
            userId: 'test-user-123'
        });
        (0, globals_1.expect)(startResponse.status).toBe(201);
        (0, globals_1.expect)(startResponse.body.success).toBe(true);
        (0, globals_1.expect)(startResponse.body.conversation).toBeDefined();
        (0, globals_1.expect)(startResponse.body.conversation.id).toBeDefined();
        const conversationId = startResponse.body.conversation.id;
        // 2. Añadir mensaje
        const appendResponse = await (0, supertest_1.default)(app)
            .post(`/api/conversations/${conversationId}/messages`)
            .set('Authorization', 'Bearer mock-token')
            .send({
            role: 'user',
            content: 'Hola, ¿cómo estás?'
        });
        (0, globals_1.expect)(appendResponse.status).toBe(201);
        (0, globals_1.expect)(appendResponse.body.success).toBe(true);
        (0, globals_1.expect)(appendResponse.body.message).toBeDefined();
        // 3. Obtener historial
        const historyResponse = await (0, supertest_1.default)(app)
            .get(`/api/conversations/${conversationId}/messages`)
            .set('Authorization', 'Bearer mock-token');
        (0, globals_1.expect)(historyResponse.status).toBe(200);
        (0, globals_1.expect)(historyResponse.body.success).toBe(true);
        (0, globals_1.expect)(historyResponse.body.messages).toBeDefined();
        (0, globals_1.expect)(Array.isArray(historyResponse.body.messages)).toBe(true);
        (0, globals_1.expect)(historyResponse.body.messages.length).toBeGreaterThan(0);
    });
    (0, globals_1.it)('should handle invalid conversation ID', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/api/conversations/invalid-id/messages')
            .set('Authorization', 'Bearer mock-token');
        (0, globals_1.expect)(response.status).toBe(404);
        (0, globals_1.expect)(response.body.success).toBe(false);
    });
});
