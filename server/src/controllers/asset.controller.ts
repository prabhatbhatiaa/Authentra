import { Request, Response, NextFunction } from 'express';
import { assetService } from '../services/asset.service.js';

export class AssetController {
  /**
   * POST /api/assets
   * Create / Draft a new digital asset
   */
  async createAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = {
        userId: req.user!.userId,
        organizationId: req.user!.organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const asset = await assetService.createAsset(req.body, actor);

      res.status(201).json({
        success: true,
        message: 'Digital asset created successfully in DRAFT state.',
        data: { asset },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assets
   * List all assets
   */
  async listAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assets = await assetService.listAssets(req.user!.organizationId);
      res.status(200).json({
        success: true,
        data: { assets },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assets/:id
   * Get single asset details
   */
  async getAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const asset = await assetService.getAssetById(id, req.user!.organizationId);

      if (!asset) {
        res.status(404).json({
          success: false,
          error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found.' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { asset },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/assets/:id/mint
   * Mint asset on-chain
   */
  async mintAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actor = {
        userId: req.user!.userId,
        organizationId: req.user!.organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await assetService.mintAsset(id, actor);

      res.status(200).json({
        success: true,
        message: 'Asset successfully minted.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/assets/:id/assign
   * Assign asset to custodian / owner
   */
  async assignAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { targetIdentityId, notes } = req.body;
      const actor = {
        userId: req.user!.userId,
        organizationId: req.user!.organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await assetService.assignAsset(id, targetIdentityId, notes, actor);

      res.status(200).json({
        success: true,
        message: 'Asset successfully assigned.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/assets/:id/transfer
   * Transfer asset custody
   */
  async transferAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { targetIdentityId, reason } = req.body;
      const actor = {
        userId: req.user!.userId,
        organizationId: req.user!.organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await assetService.transferAsset(id, targetIdentityId, reason, actor);

      res.status(200).json({
        success: true,
        message: 'Asset custody successfully transferred.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/assets/:id/revoke
   * Revoke asset
   */
  async revokeAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const actor = {
        userId: req.user!.userId,
        organizationId: req.user!.organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await assetService.revokeAsset(id, reason, actor);

      res.status(200).json({
        success: true,
        message: 'Asset successfully revoked.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assets/:id/history
   * Get ownership interval history
   */
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const history = await assetService.getOwnershipHistory(id, req.user!.organizationId);

      if (!history) {
        res.status(404).json({
          success: false,
          error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found.' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { history },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const assetController = new AssetController();
