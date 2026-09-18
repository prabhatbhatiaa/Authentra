import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { prisma } from '../config/db.js';

const router = Router();

/**
 * POST /api/assets
 * Protected by authenticate and authorize('ASSET_CREATE')
 */
router.post(
  '/',
  authenticate,
  authorize('ASSET_CREATE'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, assetType, metadata } = req.body;
      const organizationId = req.user!.organizationId;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { identity: true },
      });

      const asset = await prisma.asset.create({
        data: {
          name: name || 'Untitled Asset',
          description: description || null,
          assetType: assetType || 'SECURITY_TOKEN',
          status: 'DRAFT',
          organizationId,
          currentOwnerId: user?.identity?.id || null,
          metadata: metadata || null,
        },
      });

      // Record audit event
      await prisma.auditEvent.create({
        data: {
          action: 'ASSET_CREATED',
          entity: 'ASSET',
          entityId: asset.id,
          actorId: req.user!.userId,
          metadata: {
            name: asset.name,
            assetNumber: asset.assetNumber,
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Asset drafted successfully.',
        data: { asset },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'ASSET_CREATION_FAILED',
          message: err.message,
        },
      });
    }
  }
);

/**
 * GET /api/assets
 * Protected by authenticate and authorize('ASSET_READ')
 */
router.get(
  '/',
  authenticate,
  authorize('ASSET_READ'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const assets = await prisma.asset.findMany({
        where: { organizationId: req.user!.organizationId },
        include: {
          currentOwner: {
            select: {
              did: true,
              walletAddress: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: { assets },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'ASSET_FETCH_FAILED',
          message: err.message,
        },
      });
    }
  }
);

export default router;
