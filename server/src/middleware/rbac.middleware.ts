import { Request, Response, NextFunction } from 'express';
import { rbacService } from '../services/rbac.service.js';

/**
 * Authorization middleware enforcing specific permission.
 * Resolves permissions server-side from PostgreSQL and blocks unauthorized access with 403 Forbidden.
 *
 * Example:
 *   router.post('/assets', authenticate, authorize('ASSET_CREATE'), controller.createAsset);
 */
export const authorize = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication session required.',
          },
        });
        return;
      }

      const isAllowed = await rbacService.hasPermission(req.user.userId, requiredPermission);

      if (!isAllowed) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. Required permission: ${requiredPermission}`,
            requiredPermission,
          },
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Authorization middleware requiring ANY one of multiple permissions
 */
export const authorizeAny = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication session required.',
          },
        });
        return;
      }

      const isAllowed = await rbacService.hasAnyPermission(req.user.userId, requiredPermissions);

      if (!isAllowed) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. Requires one of permissions: ${requiredPermissions.join(', ')}`,
            requiredPermissions,
          },
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
