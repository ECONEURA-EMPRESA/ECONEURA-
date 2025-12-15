"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../src/api/http/server");
describe('GET /health', () => {
    it('debe devolver 200 y status ok', async () => {
        const app = await (0, server_1.createServer)();
        const response = await (0, supertest_1.default)(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ status: 'ok' });
    });
});
