import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller.js';

const router = Router();

// Public asset verification against DB and Aptos Testnet
router.get('/verify/:identifier', (req, res, next) =>
  verificationController.verify(req, res, next)
);

export default router;
