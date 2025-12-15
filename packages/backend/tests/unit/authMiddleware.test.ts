import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/api/http/middleware/authMiddleware';

describe('authMiddleware', () => {
  const createMockReqRes = (authHeader?: string) => {
    const req = {
      headers: authHeader ? { authorization: authHeader } : {},
      authContext: undefined
    } as unknown as Request;

    let statusCode = 200;
    let jsonBody: unknown;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: unknown) {
        jsonBody = body;
        return this;
      }
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    return { req, res, next, getStatus: () => statusCode, getBody: () => jsonBody };
  };

  it('debe rechazar si no hay token', async () => {
    const { req, res, next, getStatus } = createMockReqRes();

    await authMiddleware(req, res, next);

    expect(getStatus()).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe aceptar cuando hay token (modo dev) y rellenar authContext', async () => {
    const { req, res, next, getStatus } = createMockReqRes('Bearer dev-token');

    await authMiddleware(req, res, next);

    expect(getStatus()).toBe(200);
    expect(next).toHaveBeenCalled();
    expect((req as Request & { authContext: { userId: string } }).authContext).toBeDefined();
    expect((req as Request & { authContext: { userId: string } }).authContext.userId).toBe('dev-user');
  });
});


