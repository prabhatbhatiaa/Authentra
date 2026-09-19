import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';

export class AuditController {
  // GET /api/audit
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const { action, entity, actorId, startDate, endDate, page, limit } = req.query;

      const results = await auditService.getAuditLogs(organizationId, {
        action: action ? String(action) : undefined,
        entity: entity ? String(entity) : undefined,
        actorId: actorId ? String(actorId) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 25,
      });

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/audit/metadata
  async getAuditMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metadata = await auditService.getAuditMetadata();
      res.status(200).json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
