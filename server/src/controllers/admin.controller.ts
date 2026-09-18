import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';

export class AdminController {
  /**
   * GET /api/admin/users
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const users = await adminService.listUsers(organizationId);
      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/roles
   */
  async getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const roles = await adminService.listRoles(organizationId);
      res.status(200).json({
        success: true,
        data: { roles },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/permissions
   */
  async getPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await adminService.listPermissions();
      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/roles/assign
   */
  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.userId;
      const { userId, roleId } = req.body;
      const clientMeta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await adminService.assignRole(actorId, userId, roleId, clientMeta);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/admin/roles/revoke
   */
  async revokeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.userId;
      const { userId, roleId } = req.body;
      const clientMeta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await adminService.revokeRole(actorId, userId, roleId, clientMeta);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:userId/status
   */
  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.userId;
      const { userId } = req.params;
      const { status, reason } = req.body;
      const clientMeta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const updated = await adminService.updateUserStatus(actorId, userId, status, reason, clientMeta);
      res.status(200).json({
        success: true,
        message: `User status updated to ${status}.`,
        data: { user: updated },
      });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }
}

export const adminController = new AdminController();
