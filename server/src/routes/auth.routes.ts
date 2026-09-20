import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

// Strict rate limiting for credential-sensitive endpoints (15 attempts per 15 min window)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
});

// Public Authentication Endpoints
router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);

router.post(
  '/login',
  authLimiter,
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
