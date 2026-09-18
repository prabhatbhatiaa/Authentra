import { prisma } from '../config/db.js';
import { IdentityStatus, VerificationStatus } from '@prisma/client';

export class IdentityService {
  /**
   * Retrieve identity for the current user or by ID with associated user, roles, and asset count
   */
  async getIdentityByUserId(userId: string) {
    const identity = await prisma.identity.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            organization: true,
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            assetOwnerships: true,
            assignedAssets: true,
          },
        },
      },
    });

    if (!identity) {
      throw {
        statusCode: 404,
        code: 'IDENTITY_NOT_FOUND',
        message: 'No cryptographic identity found for this user account.',
      };
    }

    const roles = identity.user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        identity.user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name)
        )
      )
    );

    return {
      id: identity.id,
      did: identity.did,
      walletAddress: identity.walletAddress,
      status: identity.status,
      verificationStatus: identity.verificationStatus,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      user: {
        id: identity.user.id,
        email: identity.user.email,
        firstName: identity.user.firstName,
        lastName: identity.user.lastName,
        organization: {
          id: identity.user.organization.id,
          name: identity.user.organization.name,
          slug: identity.user.organization.slug,
        },
        roles,
        permissions,
      },
      stats: {
        ownedAssetsCount: identity._count.assignedAssets,
        ownershipHistoryCount: identity._count.assetOwnerships,
      },
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2020/v1',
        ],
        id: identity.did,
        controller: identity.did,
        verificationMethod: [
          {
            id: `${identity.did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: identity.did,
            blockchainAccountId: `aptos:testnet:${identity.walletAddress}`,
          },
        ],
        authentication: [`${identity.did}#key-1`],
        assertionMethod: [`${identity.did}#key-1`],
      },
    };
  }

  /**
   * Look up any identity by DID string (e.g. for public verification / lookup)
   */
  async getIdentityByDid(did: string) {
    const identity = await prisma.identity.findUnique({
      where: { did },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedAssets: true,
          },
        },
      },
    });

    if (!identity) {
      throw {
        statusCode: 404,
        code: 'IDENTITY_NOT_FOUND',
        message: `Identity not found for DID: ${did}`,
      };
    }

    const roles = identity.user.userRoles.map((ur) => ur.role.name);

    return {
      id: identity.id,
      did: identity.did,
      walletAddress: identity.walletAddress,
      status: identity.status,
      verificationStatus: identity.verificationStatus,
      createdAt: identity.createdAt,
      organization: identity.user.organization,
      roles,
      activeAssetsCount: identity._count.assignedAssets,
    };
  }

  /**
   * Update identity status (e.g. ACTIVE, SUSPENDED, REVOKED)
   */
  async updateStatus(
    identityId: string,
    status: IdentityStatus,
    actorId: string,
    reason?: string,
    clientMeta?: { ipAddress?: string; userAgent?: string }
  ) {
    const identity = await prisma.identity.findUnique({
      where: { id: identityId },
    });

    if (!identity) {
      throw {
        statusCode: 404,
        code: 'IDENTITY_NOT_FOUND',
        message: 'Identity not found.',
      };
    }

    const updated = await prisma.identity.update({
      where: { id: identityId },
      data: { status },
    });

    await prisma.auditEvent.create({
      data: {
        action: 'IDENTITY_STATUS_UPDATED',
        entity: 'IDENTITY',
        entityId: identity.id,
        actorId,
        ipAddress: clientMeta?.ipAddress || null,
        userAgent: clientMeta?.userAgent || null,
        metadata: {
          did: identity.did,
          previousStatus: identity.status,
          newStatus: status,
          reason,
        },
      },
    });

    return updated;
  }

  /**
   * Request verification or set verification status
   */
  async updateVerification(
    identityId: string,
    verificationStatus: VerificationStatus,
    actorId: string,
    notes?: string,
    clientMeta?: { ipAddress?: string; userAgent?: string }
  ) {
    const identity = await prisma.identity.findUnique({
      where: { id: identityId },
    });

    if (!identity) {
      throw {
        statusCode: 404,
        code: 'IDENTITY_NOT_FOUND',
        message: 'Identity not found.',
      };
    }

    const updated = await prisma.identity.update({
      where: { id: identityId },
      data: { verificationStatus },
    });

    await prisma.auditEvent.create({
      data: {
        action: 'IDENTITY_VERIFICATION_UPDATED',
        entity: 'IDENTITY',
        entityId: identity.id,
        actorId,
        ipAddress: clientMeta?.ipAddress || null,
        userAgent: clientMeta?.userAgent || null,
        metadata: {
          did: identity.did,
          previousStatus: identity.verificationStatus,
          newStatus: verificationStatus,
          notes,
        },
      },
    });

    return updated;
  }
}

export const identityService = new IdentityService();
