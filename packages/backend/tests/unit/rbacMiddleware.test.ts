import type { Request, Response, NextFunction } from 'express';
import { requireRoles } from '../../src/api/http/middleware/rbacMiddleware';

describe('requireRoles middleware', () => {
  const createReqRes = (roles?: string[]) => {
    const req = {
      authContext: roles ? { userId: 'u1', tenantId: 't1', roles } : undefined
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

  it('debe devolver 401 si no hay authContext', () => {
    const { req, res, next, getStatus } = createReqRes();
    const mw = requireRoles('admin');

    mw(req, res, next);

    expect(getStatus()).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe permitir acceso si el usuario tiene un rol permitido', () => {
    const { req, res, next, getStatus } = createReqRes(['user']);
    const mw = requireRoles('admin', 'user');

    mw(req, res, next);

    expect(getStatus()).toBe(200);
    expect(next).toHaveBeenCalled();
  });

  it('debe devolver 403 si el usuario no tiene rol permitido', () => {
    const { req, res, next, getStatus, getBody } = createReqRes(['viewer']);
    const mw = requireRoles('admin', 'user');

    mw(req, res, next);

    expect(getStatus()).toBe(403);
    expect(next).not.toHaveBeenCalled();
    expect(getBody()).toEqual({ success: false, error: 'Insufficient permissions' });
  });
});


