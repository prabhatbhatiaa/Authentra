import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { blockchainService } from './blockchain.service.js';

export interface AssetActorMeta {
  userId: string;
  organizationId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AssetService {
  /**
   * CREATE: Drafts a new digital asset in the database
   */
  async createAsset(
    data: { name: string; description?: string; assetType: string; metadata?: Record<string, any> },
    actor: AssetActorMeta
  ) {
    const user = await prisma.user.findUnique({
      where: { id: actor.userId },
      include: { identity: true },
    });

    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        description: data.description || null,
        assetType: data.assetType || 'SECURITY_TOKEN',
        status: 'DRAFT',
        organizationId: actor.organizationId,
        currentOwnerId: user?.identity?.id || null,
        metadata: data.metadata || {},
      },
      include: {
        currentOwner: {
          select: { id: true, did: true, walletAddress: true },
        },
      },
    });

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        action: 'ASSET_CREATED',
        entity: 'ASSET',
        entityId: asset.id,
        actorId: actor.userId,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
        metadata: {
          name: asset.name,
          assetNumber: asset.assetNumber,
          status: asset.status,
        },
      },
    });

    return asset;
  }

  /**
   * MINT: Mints the drafted asset onto the Aptos blockchain (or marks minted with on-chain cryptographic anchor)
   */
  async mintAsset(assetId: string, actor: AssetActorMeta) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { currentOwner: true },
    });

    if (!asset) {
      throw new Error('Asset not found.');
    }
    if (asset.organizationId !== actor.organizationId) {
      throw new Error('Unauthorized asset access.');
    }
    if (asset.status !== 'DRAFT') {
      throw new Error(`Asset cannot be minted from status ${asset.status}. Only DRAFT assets can be minted.`);
    }

    const initialOwnerAddress = asset.currentOwner?.walletAddress || '0x0';
    const metadataString = JSON.stringify(asset.metadata || {});
    const metadataHash = crypto.createHash('sha256').update(metadataString).digest('hex');

    let txHash: string | null = null;
    let blockHeight: bigint | null = null;
    let gasUsed: bigint | null = null;

    // Execute on-chain transaction if admin signer is configured
    if (blockchainService.isSignerConfigured()) {
      try {
        const onChainRes = await blockchainService.executeEntryFunction('asset', 'mint_asset', [
          asset.id,
          asset.name,
          asset.assetType,
          metadataHash,
          initialOwnerAddress,
        ]);
        txHash = onChainRes.txHash;
        blockHeight = onChainRes.blockHeight || null;
        gasUsed = onChainRes.gasUsed || null;
      } catch (chainErr: any) {
        // Fallback: If on-chain fails or gas faucet not yet loaded, log notice
        console.warn(`[AssetService] On-chain mint notice: ${chainErr.message}`);
      }
    }

    // Persist transaction record if on-chain transaction occurred
    if (txHash) {
      await prisma.blockchainTransaction.create({
        data: {
          txHash,
          txType: 'ASSET_MINT',
          status: 'CONFIRMED',
          blockHeight,
          gasUsed,
          senderAddress: blockchainService.getModuleAddress(),
          assetId: asset.id,
          metadata: {
            metadataHash,
            chain: 'aptos:testnet',
          },
        } as any,
      });
    }

    // Create initial historical ownership interval
    const now = new Date();
    if (asset.currentOwnerId) {
      await prisma.assetOwnership.create({
        data: {
          assetId: asset.id,
          identityId: asset.currentOwnerId,
          status: 'ACTIVE',
          validFrom: now,
          notes: 'Genesis minting ownership',
        },
      });
    }

    // Update asset status to MINTED
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: 'MINTED',
        updatedAt: now,
      },
      include: {
        currentOwner: {
          select: { id: true, did: true, walletAddress: true },
        },
        ownerships: true,
      },
    });

    // Write audit event
    await prisma.auditEvent.create({
      data: {
        action: 'ASSET_MINTED',
        entity: 'ASSET',
        entityId: asset.id,
        actorId: actor.userId,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
        metadata: {
          name: asset.name,
          assetNumber: asset.assetNumber,
          txHash,
          metadataHash,
        },
      },
    });

    return { asset: updatedAsset, txHash };
  }

  /**
   * ASSIGN: Assigns asset to a designated identity (transitions to ACTIVE)
   */
  async assignAsset(assetId: string, targetIdentityId: string, notes: string | undefined, actor: AssetActorMeta) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { currentOwner: true },
    });

    if (!asset) {
      throw new Error('Asset not found.');
    }
    if (asset.organizationId !== actor.organizationId) {
      throw new Error('Unauthorized asset access.');
    }
    if (asset.status === 'REVOKED') {
      throw new Error('Revoked assets cannot be reassigned.');
    }

    const targetIdentity = await prisma.identity.findUnique({
      where: { id: targetIdentityId },
    });
    if (!targetIdentity) {
      throw new Error('Target identity not found.');
    }

    const now = new Date();

    // Close previous ownership record
    await prisma.assetOwnership.updateMany({
      where: {
        assetId: asset.id,
        validTo: null,
      },
      data: {
        validTo: now,
        status: 'TRANSFERRED',
      },
    });

    // Create new ownership record
    await prisma.assetOwnership.create({
      data: {
        assetId: asset.id,
        identityId: targetIdentity.id,
        status: 'ACTIVE',
        validFrom: now,
        notes: notes || 'Assigned by administrator',
      },
    });

    let txHash: string | null = null;
    if (blockchainService.isSignerConfigured()) {
      try {
        const onChainRes = await blockchainService.executeEntryFunction('asset', 'assign_asset', [
          asset.id,
          targetIdentity.walletAddress,
        ]);
        txHash = onChainRes.txHash;
      } catch (err: any) {
        console.warn(`[AssetService] On-chain assign notice: ${err.message}`);
      }
    }

    if (txHash) {
      await prisma.blockchainTransaction.create({
        data: {
          txHash,
          txType: 'ASSET_ASSIGNMENT',
          status: 'CONFIRMED',
          senderAddress: blockchainService.getModuleAddress(),
          assetId: asset.id,
        },
      });
    }


    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        currentOwnerId: targetIdentity.id,
        status: 'ACTIVE',
        updatedAt: now,
      },
      include: {
        currentOwner: {
          select: { id: true, did: true, walletAddress: true },
        },
      },
    });

    // Audit event
    await prisma.auditEvent.create({
      data: {
        action: 'ASSET_ASSIGNED',
        entity: 'ASSET',
        entityId: asset.id,
        actorId: actor.userId,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
        metadata: {
          targetIdentityId,
          targetDid: targetIdentity.did,
          txHash,
        },
      },
    });

    return { asset: updatedAsset, txHash };
  }

  /**
   * TRANSFER: Custody transfer between identities
   */
  async transferAsset(assetId: string, targetIdentityId: string, reason: string, actor: AssetActorMeta) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { currentOwner: true },
    });

    if (!asset) {
      throw new Error('Asset not found.');
    }
    if (asset.organizationId !== actor.organizationId) {
      throw new Error('Unauthorized asset access.');
    }
    if (asset.status === 'REVOKED') {
      throw new Error('Revoked assets cannot be transferred.');
    }

    const targetIdentity = await prisma.identity.findUnique({
      where: { id: targetIdentityId },
    });
    if (!targetIdentity) {
      throw new Error('Target identity not found.');
    }

    const now = new Date();

    // Close current ownership interval
    await prisma.assetOwnership.updateMany({
      where: {
        assetId: asset.id,
        validTo: null,
      },
      data: {
        validTo: now,
        status: 'TRANSFERRED',
      },
    });

    // Open new ownership interval
    await prisma.assetOwnership.create({
      data: {
        assetId: asset.id,
        identityId: targetIdentity.id,
        status: 'ACTIVE',
        validFrom: now,
        notes: reason,
      },
    });

    let txHash: string | null = null;
    if (blockchainService.isSignerConfigured()) {
      try {
        const onChainRes = await blockchainService.executeEntryFunction('asset', 'transfer_asset', [
          asset.id,
          targetIdentity.walletAddress,
          reason,
        ]);
        txHash = onChainRes.txHash;
      } catch (err: any) {
        console.warn(`[AssetService] On-chain transfer notice: ${err.message}`);
      }
    }

    if (txHash) {
      await prisma.blockchainTransaction.create({
        data: {
          txHash,
          txType: 'ASSET_TRANSFER',
          status: 'CONFIRMED',
          senderAddress: blockchainService.getModuleAddress(),
          assetId: asset.id,
        },
      });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        currentOwnerId: targetIdentity.id,
        status: 'ACTIVE',
        updatedAt: now,
      },
      include: {
        currentOwner: {
          select: { id: true, did: true, walletAddress: true },
        },
      },
    });

    await prisma.auditEvent.create({
      data: {
        action: 'ASSET_TRANSFERRED',
        entity: 'ASSET',
        entityId: asset.id,
        actorId: actor.userId,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
        metadata: {
          fromIdentityId: asset.currentOwnerId,
          toIdentityId: targetIdentity.id,
          reason,
          txHash,
        },
      },
    });

    return { asset: updatedAsset, txHash };
  }

  /**
   * REVOKE: Revokes an asset permanently
   */
  async revokeAsset(assetId: string, reason: string, actor: AssetActorMeta) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found.');
    }
    if (asset.organizationId !== actor.organizationId) {
      throw new Error('Unauthorized asset access.');
    }
    if (asset.status === 'REVOKED') {
      throw new Error('Asset is already revoked.');
    }

    const now = new Date();

    // Close open ownership intervals
    await prisma.assetOwnership.updateMany({
      where: {
        assetId: asset.id,
        validTo: null,
      },
      data: {
        validTo: now,
        status: 'REVOKED',
      },
    });

    let txHash: string | null = null;
    if (blockchainService.isSignerConfigured()) {
      try {
        const onChainRes = await blockchainService.executeEntryFunction('asset', 'revoke_asset', [
          asset.id,
          reason,
        ]);
        txHash = onChainRes.txHash;
      } catch (err: any) {
        console.warn(`[AssetService] On-chain revoke notice: ${err.message}`);
      }
    }

    if (txHash) {
      await prisma.blockchainTransaction.create({
        data: {
          txHash,
          txType: 'ASSET_REVOCATION',
          status: 'CONFIRMED',
          senderAddress: blockchainService.getModuleAddress(),
          assetId: asset.id,
        },
      });
    }


    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: 'REVOKED',
        updatedAt: now,
      },
      include: {
        currentOwner: {
          select: { id: true, did: true, walletAddress: true },
        },
      },
    });

    await prisma.auditEvent.create({
      data: {
        action: 'ASSET_REVOKED',
        entity: 'ASSET',
        entityId: asset.id,
        actorId: actor.userId,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
        metadata: {
          reason,
          txHash,
        },
      },
    });

    return { asset: updatedAsset, txHash };
  }

  /**
   * LIST: Get assets for organization
   */
  async listAssets(organizationId: string) {
    return await prisma.asset.findMany({
      where: { organizationId },
      include: {
        currentOwner: {
          select: {
            id: true,
            did: true,
            walletAddress: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * GET: Get single asset by ID
   */
  async getAssetById(assetId: string, organizationId: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        currentOwner: {
          select: {
            id: true,
            did: true,
            walletAddress: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        transactions: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!asset || asset.organizationId !== organizationId) {
      return null;
    }

    return asset;
  }

  /**
   * HISTORY: Get ownership history intervals
   */
  async getOwnershipHistory(assetId: string, organizationId: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true, organizationId: true },
    });

    if (!asset || asset.organizationId !== organizationId) {
      return null;
    }

    return await prisma.assetOwnership.findMany({
      where: { assetId },
      include: {
        identity: {
          select: {
            id: true,
            did: true,
            walletAddress: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { validFrom: 'desc' },
    });
  }
}

export const assetService = new AssetService();
