import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/dashboard/metrics
router.get('/metrics', authenticate, (req, res, next) =>
  dashboardController.getMetrics(req, res, next)
);

export default router;
