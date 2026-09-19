import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller.js';

const router = Router();

/**
 * GET /api/verification/verify/:identifier
 * Public endpoint for verifying digital assets against PostgreSQL & Aptos Testnet
 */
router.get('/verify/:identifier', (req, res, next) =>
  verificationController.verify(req, res, next)
);

export default router;
