import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

// Retrieve audit logs (requires AUDIT_READ permission)
router.get(
  '/',
  authenticate,
  authorize('AUDIT_READ'),
  (req, res, next) => auditController.getAuditLogs(req, res, next)
);

// Retrieve available filter choices for the UI
router.get(
  '/metadata',
  authenticate,
  authorize('AUDIT_READ'),
  (req, res, next) => auditController.getAuditMetadata(req, res, next)
);

export default router;
