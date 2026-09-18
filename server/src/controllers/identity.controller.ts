import { Request, Response, NextFunction } from 'express';
import { identityService } from '../services/identity.service.js';

export class IdentityController {
  /**
   * GET /api/identity/me
   * Get the current authenticated user's identity details
   */
  async getMyIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
        });
        return;
      }

      const identity = await identityService.getIdentityByUserId(req.user.userId);
      res.status(200).json({
        success: true,
        data: { identity },
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
   * GET /api/identity/resolve/:did
   * Resolve any public DID document and verification metadata
   */
  async resolveDid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const did = req.params.did;
      const identity = await identityService.getIdentityByDid(did);
      res.status(200).json({
        success: true,
        data: { identity },
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
   * PATCH /api/identity/:id/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const clientMeta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const updated = await identityService.updateStatus(
        id,
        status,
        req.user?.userId || 'SYSTEM',
        reason,
        clientMeta
      );

      res.status(200).json({
        success: true,
        message: `Identity status successfully updated to ${status}.`,
        data: { identity: updated },
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
   * POST /api/identity/:id/verify
   * Request / update verification status
   */
  async updateVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { verificationStatus, notes } = req.body;
      const clientMeta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const updated = await identityService.updateVerification(
        id,
        verificationStatus,
        req.user?.userId || 'SYSTEM',
        notes,
        clientMeta
      );

      res.status(200).json({
        success: true,
        message: `Identity verification status updated to ${verificationStatus}.`,
        data: { identity: updated },
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

export const identityController = new IdentityController();
