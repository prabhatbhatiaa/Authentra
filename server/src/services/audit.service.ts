import { prisma } from '../config/db.js';

export interface AuditQueryFilters {
  action?: string;
  entity?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class AuditService {
  // Query audit logs with pagination and flexible filters
  async getAuditLogs(organizationId: string, filters: AuditQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 25));
    const skip = (page - 1) * limit;

    const whereClause: any = {
      // Scope queries to users belonging to the caller's organization
      OR: [
        {
          actor: {
            organizationId,
          },
        },
        {
          // Capture system-level events (like migrations or root provisioning)
          actorId: null,
        },
      ],
    };

    if (filters.action && filters.action !== 'ALL') {
      whereClause.action = filters.action;
    }

    if (filters.entity && filters.entity !== 'ALL') {
      whereClause.entity = filters.entity;
    }

    if (filters.actorId) {
      whereClause.actorId = filters.actorId;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Run count and query in parallel to keep things snappy
    const [total, events] = await Promise.all([
      prisma.auditEvent.count({ where: whereClause }),
      prisma.auditEvent.findMany({
        where: whereClause,
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              identity: {
                select: {
                  did: true,
                  walletAddress: true,
                },
              },
            },
          },
          transaction: {
            select: {
              txHash: true,
              txType: true,
              status: true,
              blockHeight: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      events: events.map((event) => ({
        id: event.id,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId,
        actor: event.actor
          ? {
              id: event.actor.id,
              name: `${event.actor.firstName} ${event.actor.lastName}`,
              email: event.actor.email,
              did: event.actor.identity?.did || null,
              walletAddress: event.actor.identity?.walletAddress || null,
            }
          : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        transaction: event.transaction
          ? {
              txHash: event.transaction.txHash,
              txType: event.transaction.txType,
              status: event.transaction.status,
              blockHeight: event.transaction.blockHeight
                ? event.transaction.blockHeight.toString()
                : null,
            }
          : null,
        metadata: event.metadata,
        createdAt: event.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Returns distinct actions and entities present in the DB so UI dropdowns stay current
  async getAuditMetadata() {
    const [actions, entities] = await Promise.all([
      prisma.auditEvent.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
      }),
      prisma.auditEvent.findMany({
        select: { entity: true },
        distinct: ['entity'],
        orderBy: { entity: 'asc' },
      }),
    ]);

    return {
      actions: actions.map((a) => a.action),
      entities: entities.map((e) => e.entity),
    };
  }
}

export const auditService = new AuditService();
