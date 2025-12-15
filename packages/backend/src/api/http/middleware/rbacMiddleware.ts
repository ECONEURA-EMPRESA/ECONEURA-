import type { Request, Response, NextFunction } from 'express';
import type { AuthContext } from '../../../shared/types/auth';

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authContext = req.authContext as AuthContext | undefined;

    if (!authContext) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (allowedRoles.length === 0) {
      next();
      return;
    }

    const hasRole = authContext.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
}


