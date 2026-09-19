import { prisma } from '../config/db.js';
import { blockchainService } from './blockchain.service.js';

export interface DashboardMetrics {
  identity: {
    totalUsers: number;
    activeIdentities: number;
    verifiedIdentities: number;
  };
  assets: {
    total: number;
    draft: number;
    minted: number;
    active: number;
    transferred: number;
    revoked: number;
  };
  blockchain: {
    network: string;
    moduleAddress: string;
    connected: boolean;
    blockHeight: string | null;
    epoch: string | null;
    totalTransactions: number;
  };
  recentTransactions: Array<{
    txHash: string;
    txType: string;
    status: string;
    blockHeight: string | null;
    submittedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    actorName: string;
    actorEmail: string;
    createdAt: string;
  }>;
}

export class DashboardService {
  /**
   * Aggregate high-level executive metrics for an organization
   */
  async getMetrics(organizationId: string): Promise<DashboardMetrics> {
    // Run DB aggregation queries in parallel
    const [
      totalUsers,
      activeIdentities,
      verifiedIdentities,
      assetCounts,
      totalTxs,
      recentTxs,
      recentEvents,
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId } }),
      prisma.identity.count({
        where: { user: { organizationId }, status: 'ACTIVE' },
      }),
      prisma.identity.count({
        where: { user: { organizationId }, verificationStatus: 'VERIFIED' },
      }),
      prisma.asset.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: { status: true },
      }),
      prisma.blockchainTransaction.count(),
      prisma.blockchainTransaction.findMany({
        orderBy: { submittedAt: 'desc' },
        take: 5,
      }),
      prisma.auditEvent.findMany({
        where: {
          OR: [
            { actor: { organizationId } },
            { actorId: null },
          ],
        },
        include: {
          actor: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    // Map grouped asset status counts
    const assetStats = {
      total: 0,
      draft: 0,
      minted: 0,
      active: 0,
      transferred: 0,
      revoked: 0,
    };

    for (const group of assetCounts) {
      const count = group._count.status;
      assetStats.total += count;
      if (group.status === 'DRAFT') assetStats.draft = count;
      if (group.status === 'MINTED') assetStats.minted = count;
      if (group.status === 'ACTIVE') assetStats.active = count;
      if (group.status === 'TRANSFERRED') assetStats.transferred = count;
      if (group.status === 'REVOKED') assetStats.revoked = count;
    }

    // Query live Aptos network status
    let connected = false;
    let blockHeight: string | null = null;
    let epoch: string | null = null;

    try {
      const ledger = await blockchainService.getLedgerInfo();
      if (ledger) {
        connected = true;
        blockHeight = ledger.block_height;
        epoch = ledger.epoch;
      }
    } catch {
      connected = false;
    }

    return {
      identity: {
        totalUsers,
        activeIdentities,
        verifiedIdentities,
      },
      assets: assetStats,
      blockchain: {
        network: blockchainService.getNetwork(),
        moduleAddress: blockchainService.getModuleAddress(),
        connected,
        blockHeight,
        epoch,
        totalTransactions: totalTxs,
      },
      recentTransactions: recentTxs.map((tx) => ({
        txHash: tx.txHash,
        txType: tx.txType,
        status: tx.status,
        blockHeight: tx.blockHeight ? tx.blockHeight.toString() : null,
        submittedAt: tx.submittedAt.toISOString(),
      })),
      recentActivity: recentEvents.map((evt) => ({
        id: evt.id,
        action: evt.action,
        entity: evt.entity,
        actorName: evt.actor
          ? `${evt.actor.firstName} ${evt.actor.lastName}`
          : 'System Provisioner',
        actorEmail: evt.actor ? evt.actor.email : 'system@authentra.internal',
        createdAt: evt.createdAt.toISOString(),
      })),
    };
  }
}

export const dashboardService = new DashboardService();
