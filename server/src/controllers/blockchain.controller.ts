import { Request, Response, NextFunction } from 'express';
import { blockchainService } from '../services/blockchain.service.js';

export class BlockchainController {
  /**
   * GET /api/blockchain/status
   * Retrieve real-time network, ledger info, module configuration, and signer status
   */
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let ledgerInfo = null;
      let connected = false;

      try {
        ledgerInfo = await blockchainService.getLedgerInfo();
        connected = true;
      } catch (err) {
        connected = false;
      }

      res.status(200).json({
        success: true,
        data: {
          network: blockchainService.getNetwork(),
          moduleAddress: blockchainService.getModuleAddress(),
          isSignerConfigured: blockchainService.isSignerConfigured(),
          connected,
          ledger: ledgerInfo
            ? {
                chainId: ledgerInfo.chain_id,
                epoch: ledgerInfo.epoch,
                ledgerVersion: ledgerInfo.ledger_version,
                blockHeight: ledgerInfo.block_height,
                ledgerTimestamp: ledgerInfo.ledger_timestamp,
              }
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/blockchain/transactions/:txHash
   * Retrieve transaction details directly from the Aptos node
   */
  async getTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { txHash } = req.params;
      const transaction = await blockchainService.getTransaction(txHash);

      if (!transaction) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: `Transaction ${txHash} was not found on Aptos ${blockchainService.getNetwork()}.`,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/blockchain/account/:address
   * Retrieve balance and on-chain identity for an address
   */
  async getAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address } = req.params;
      const balance = await blockchainService.getAccountBalance(address);
      const identity = await blockchainService.getOnChainIdentity(address);

      res.status(200).json({
        success: true,
        data: {
          address,
          balanceOctas: balance,
          balanceApt: balance / 100_000_000,
          identity,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const blockchainController = new BlockchainController();
