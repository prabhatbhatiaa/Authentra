import { Router } from 'express';
import { assetController } from '../controllers/asset.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {

  createAssetSchema,
  assignAssetSchema,
  transferAssetSchema,
  revokeAssetSchema,
} from '../validators/asset.validator.js';

const router = Router();

// 1. Create (Draft) Asset
router.post(
  '/',
  authenticate,
  authorize('ASSET_CREATE'),
  validateRequest(createAssetSchema),
  (req, res, next) => assetController.createAsset(req, res, next)
);

// 2. List Assets
router.get(
  '/',
  authenticate,
  authorize('ASSET_READ'),
  (req, res, next) => assetController.listAssets(req, res, next)
);

// 3. Get Single Asset Details
router.get(
  '/:id',
  authenticate,
  authorize('ASSET_READ'),
  (req, res, next) => assetController.getAsset(req, res, next)
);

// 4. Mint Asset
router.post(
  '/:id/mint',
  authenticate,
  authorize('ASSET_CREATE'),
  (req, res, next) => assetController.mintAsset(req, res, next)
);

// 5. Assign Asset
router.post(
  '/:id/assign',
  authenticate,
  authorize('ASSET_TRANSFER'),
  validateRequest(assignAssetSchema),
  (req, res, next) => assetController.assignAsset(req, res, next)
);

// 6. Transfer Asset Custody
router.post(
  '/:id/transfer',
  authenticate,
  authorize('ASSET_TRANSFER'),
  validateRequest(transferAssetSchema),
  (req, res, next) => assetController.transferAsset(req, res, next)
);

// 7. Revoke Asset
router.post(
  '/:id/revoke',
  authenticate,
  authorize('ASSET_REVOKE'),
  validateRequest(revokeAssetSchema),
  (req, res, next) => assetController.revokeAsset(req, res, next)
);


// 8. Asset Ownership History
router.get(
  '/:id/history',
  authenticate,
  authorize('ASSET_READ'),
  (req, res, next) => assetController.getHistory(req, res, next)
);

export default router;
