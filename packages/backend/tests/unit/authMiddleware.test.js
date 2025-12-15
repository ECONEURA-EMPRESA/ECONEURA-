"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const authMiddleware = require('../../src/api/http/middleware/authMiddleware');
describe('authMiddleware', () => {
    const createMockReqRes = (authHeader) => {
        const req = {
            headers: authHeader ? { authorization: authHeader } : {},
            authContext: undefined
        };
        let statusCode = 200;
        let jsonBody;
        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(body) {
                jsonBody = body;
                return this;
            }
        };
        const next = jest.fn();
        return { req, res, next, getStatus: () => statusCode, getBody: () => jsonBody };
    };
    it('debe rechazar si no hay token', async () => {
        const { req, res, next, getStatus } = createMockReqRes();
        await (0, authMiddleware_1.authMiddleware)(req, res, next);
        expect(getStatus()).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });
    it('debe aceptar cuando hay token (modo dev) y rellenar authContext', async () => {
        const { req, res, next, getStatus } = createMockReqRes('Bearer dev-token');
        await (0, authMiddleware_1.authMiddleware)(req, res, next);
        expect(getStatus()).toBe(200);
        expect(next).toHaveBeenCalled();
        expect(req.authContext).toBeDefined();
        expect(req.authContext.userId).toBe('dev-user');
    });
});
