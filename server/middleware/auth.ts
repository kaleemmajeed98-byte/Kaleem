import { Request, Response, NextFunction } from 'express';
import { verifyJwt, dbStore, UserRecord, TenantRecord } from '../db/store.js';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  tenant?: TenantRecord;
  tenantId?: string | null;
  permissions?: string[];
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // unauthenticated (public endpoints will check req.user)
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'JWT token is invalid or has expired' },
    });
  }

  const user = dbStore.users.find((u) => u.id === payload.sub);
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      error: { code: 'USER_DEACTIVATED', message: 'User account not found or disabled' },
    });
  }

  req.user = user;
  req.tenantId = user.tenantId;
  req.permissions = user.permissions;

  if (user.tenantId) {
    req.tenant = dbStore.tenants.find((t) => t.id === user.tenantId);
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required for this resource' },
    });
  }
  next();
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'PLATFORM_SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Super Admin platform privileges required' },
    });
  }
  next();
}

export function requirePermission(permissionCode: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (req.user.role === 'PLATFORM_SUPER_ADMIN' || req.user.permissions.includes('*')) {
      return next();
    }

    if (!req.user.permissions.includes(permissionCode)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Missing required permission: ${permissionCode}`,
        },
      });
    }

    next();
  };
}
