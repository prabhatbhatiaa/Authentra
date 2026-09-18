import { Router } from 'express';
import { blockchainController } from '../controllers/blockchain.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public blockchain status and transaction lookup
router.get('/status', (req, res, next) => blockchainController.getStatus(req, res, next));
router.get('/transactions/:txHash', (req, res, next) => blockchainController.getTransaction(req, res, next));
router.get('/account/:address', (req, res, next) => blockchainController.getAccount(req, res, next));

export default router;
