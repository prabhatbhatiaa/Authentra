import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  assignRoleSchema,
  revokeRoleSchema,
  updateUserStatusSchema,
} from '../validators/admin.validator.js';

const router = Router();

// All Admin routes require valid authentication
router.use(authenticate);

// View Users: requires ROLE_ASSIGN or ADMIN
router.get(
  '/users',
  authorize('ROLE_ASSIGN'),
  (req, res, next) => adminController.getUsers(req, res, next)
);

// View Roles: requires ROLE_ASSIGN or ADMIN
router.get(
  '/roles',
  authorize('ROLE_ASSIGN'),
  (req, res, next) => adminController.getRoles(req, res, next)
);

// View Permissions: requires ROLE_ASSIGN or AUDIT_READ or ADMIN
router.get(
  '/permissions',
  authorize('ROLE_ASSIGN'),
  (req, res, next) => adminController.getPermissions(req, res, next)
);

// Assign Role to User: requires ROLE_ASSIGN
router.post(
  '/roles/assign',
  authorize('ROLE_ASSIGN'),
  validateRequest(assignRoleSchema),
  (req, res, next) => adminController.assignRole(req, res, next)
);

// Revoke Role from User: requires ROLE_REVOKE
router.post(
  '/roles/revoke',
  authorize('ROLE_REVOKE'),
  validateRequest(revokeRoleSchema),
  (req, res, next) => adminController.revokeRole(req, res, next)
);

// Update User Account Status: requires ROLE_ASSIGN
router.patch(
  '/users/:userId/status',
  authorize('ROLE_ASSIGN'),
  validateRequest(updateUserStatusSchema),
  (req, res, next) => adminController.updateUserStatus(req, res, next)
);

export default router;
