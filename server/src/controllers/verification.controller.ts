import { Request, Response, NextFunction } from 'express';
import { verificationService } from '../services/verification.service.js';

export class VerificationController {
  /**
   * GET /api/verification/verify/:identifier
   * Public verification endpoint accepting assetId, assetNumber, or exact name
   */
  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier } = req.params;
      if (!identifier || identifier.trim() === '') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_IDENTIFIER',
            message: 'An asset identifier or asset number must be provided for verification.',
          },
        });
        return;
      }

      const result = await verificationService.verifyAsset(identifier);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const verificationController = new VerificationController();
