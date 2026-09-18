import { Router } from 'express';
import { identityController } from '../controllers/identity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  updateIdentityStatusSchema,
  updateVerificationStatusSchema,
} from '../validators/identity.validator.js';

const router = Router();

// Get the authenticated user's full identity & DID Document
router.get(
  '/me',
  authenticate,
  authorize('IDENTITY_READ'),
  (req, res, next) => identityController.getMyIdentity(req, res, next)
);

// Public DID Document resolution endpoint
router.get(
  '/resolve/:did',
  (req, res, next) => identityController.resolveDid(req, res, next)
);

// Update identity status (e.g. ACTIVE, SUSPENDED, REVOKED)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ROLE_ASSIGN'),
  validateRequest(updateIdentityStatusSchema),
  (req, res, next) => identityController.updateStatus(req, res, next)
);

// Update verification status (e.g. VERIFIED, PENDING_VERIFICATION)
router.post(
  '/:id/verify',
  authenticate,
  authorize('IDENTITY_READ'),
  validateRequest(updateVerificationStatusSchema),
  (req, res, next) => identityController.updateVerification(req, res, next)
);

export default router;
