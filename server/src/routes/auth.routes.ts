import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

// Public Authentication Endpoints
router.post(
  '/register',
  validateRequest(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);

router.post(
  '/login',
  validateRequest(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

// Protected Authentication Endpoints
router.get(
  '/me',
  authenticate,
  (req, res, next) => authController.getMe(req, res, next)
);

router.post(
  '/logout',
  authenticate,
  (req, res, next) => authController.logout(req, res, next)
);

export default router;
