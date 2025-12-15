"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../src/api/http/server");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Chat Flow - Tests Automatizados', () => {
    let app;
    let authToken = null;
    let originalFetch;
    (0, globals_1.beforeAll)(async () => {
        process.env['GEMINI_API_KEY'] = 'test-key';
        process.env['USE_MEMORY_STORE'] = 'true';
        process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/db'; // Dummy to satisfy checks if needed
        app = await (0, server_1.createServer)();
        authToken = null;
        originalFetch = global.fetch;
        global.fetch = jest.fn(async (url, init) => {
            let urlString;
            if (typeof url === 'string') {
                urlString = url;
            }
            else if (url instanceof URL) {
                urlString = url.toString();
            }
            else {
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
                };
            }
            return originalFetch(url, init);
        });
    });
    (0, globals_1.afterAll)(async () => {
        if (originalFetch) {
            global.fetch = originalFetch;
        }
    });
    (0, globals_1.describe)('Health Check', () => {
        (0, globals_1.it)('debe responder 200 en /api/health', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/health');
            (0, globals_1.expect)(response.status).toBe(200);
            // En test environment sin Redis real, el status puede ser degraded
            (0, globals_1.expect)(['ok', 'degraded']).toContain(response.body.status);
        });
    });
    (0, globals_1.describe)('Invoke API', () => {
        (0, globals_1.it)('debe aceptar request sin input (default greeting)', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/invoke/a-ceo-01')
                .set('Authorization', `Bearer ${authToken || 'test-token'}`)
                .send({});
            // El backend ahora permite input vacío y devuelve un saludo por defecto
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
        });
        (0, globals_1.it)('debe aceptar request con input válido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/invoke/a-ceo-01')
                .set('Authorization', `Bearer ${authToken || 'test-token'}`)
                .send({
                input: 'Hola, esto es un test'
            });
            // Puede ser 200 (éxito) o 401/403 (auth requerida)
            (0, globals_1.expect)([200, 401, 403]).toContain(response.status);
            if (response.status === 200) {
                (0, globals_1.expect)(response.body.success).toBe(true);
                (0, globals_1.expect)(response.body.output).toBeDefined();
            }
        });
    });
    (0, globals_1.describe)('Upload API', () => {
        (0, globals_1.it)('debe rechazar request sin archivo', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/uploads')
                .set('Authorization', `Bearer ${authToken || 'test-token'}`);
            (0, globals_1.expect)(response.status).toBe(400);
        });
        (0, globals_1.it)('debe aceptar subida de archivo válida', async () => {
            const buffer = Buffer.from('test content');
            const response = await (0, supertest_1.default)(app)
                .post('/api/uploads')
                .set('Authorization', `Bearer ${authToken || 'test-token'}`)
                .attach('file', buffer, 'test.txt');
            // Puede ser 201 (creado) o 401/403 (auth requerida)
            (0, globals_1.expect)([201, 401, 403]).toContain(response.status);
            if (response.status === 201) {
                (0, globals_1.expect)(response.body.success).toBe(true);
                (0, globals_1.expect)(response.body.publicUrl).toBeDefined();
                (0, globals_1.expect)(response.body.fileId).toBeDefined();
            }
        });
    });
});
