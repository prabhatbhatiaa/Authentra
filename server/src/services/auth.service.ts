import { prisma } from '../config/db.js';
import { hashPassword, verifyPassword, signToken, AuthTokenPayload } from '../utils/security.js';
import { generateCryptographicIdentity } from '../utils/did.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { UserStatus, IdentityStatus, VerificationStatus } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user, create their cryptographic Identity, assign default role, and record audit log
   */
  async register(input: RegisterInput, clientMeta?: { ipAddress?: string; userAgent?: string }) {
    // 1. Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw {
        statusCode: 409,
        code: 'USER_ALREADY_EXISTS',
        message: `An account with email ${input.email} already exists.`,
      };
    }

    // 2. Resolve or create organization
    let organizationId: string;
    if (input.organizationName) {
      const slug = input.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let org = await prisma.organization.findUnique({ where: { slug } });
      if (!org) {
        org = await prisma.organization.create({
          data: {
            name: input.organizationName,
            slug,
          },
        });
      }
      organizationId = org.id;
    } else {
      // Use root or default organization
      let defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) {
        defaultOrg = await prisma.organization.create({
          data: {
            name: 'Authentra Organization',
            slug: 'authentra-org',
          },
        });
      }
      organizationId = defaultOrg.id;
    }

    // 3. Hash password with Argon2id
    const passwordHash = await hashPassword(input.password);

    // 4. Derive Cryptographic Identity (DID + Aptos Account)
    const { did, walletAddress } = generateCryptographicIdentity(input.walletAddress);

    // 5. Execute atomic transaction (User + Identity + Role Assignment + Audit Event)
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          firstName: input.firstName || null,
          lastName: input.lastName || null,
          status: UserStatus.ACTIVE,
          organizationId,
        },
      });

      // Create Cryptographic Identity
      const identity = await tx.identity.create({
        data: {
          did,
          walletAddress,
          status: IdentityStatus.ACTIVE,
          verificationStatus: VerificationStatus.PENDING_VERIFICATION,
          userId: user.id,
        },
      });

      // Find or create default USER role
      let userRole = await tx.role.findFirst({
        where: { name: 'USER' },
      });

      if (userRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: userRole.id,
          },
        });
      }

      // Record Audit Event
      await tx.auditEvent.create({
        data: {
          action: 'USER_REGISTERED',
          entity: 'USER',
          entityId: user.id,
          actorId: user.id,
          ipAddress: clientMeta?.ipAddress || null,
          userAgent: clientMeta?.userAgent || null,
          metadata: {
            email: user.email,
            did: identity.did,
            walletAddress: identity.walletAddress,
            organizationId,
          },
        },
      });

      return { user, identity, roles: userRole ? ['USER'] : [] };
    });

    // 6. Sign JWT session token
    const tokenPayload: AuthTokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      organizationId,
      identityId: result.identity.id,
      did: result.identity.did,
      roles: result.roles,
    };

    const token = signToken(tokenPayload);

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        organizationId,
        identity: {
          id: result.identity.id,
          did: result.identity.did,
          walletAddress: result.identity.walletAddress,
          status: result.identity.status,
          verificationStatus: result.identity.verificationStatus,
        },
        roles: result.roles,
      },
    };
  }

  /**
   * Authenticate user, verify Argon2id hash, log audit event, return session token
   */
  async login(input: LoginInput, clientMeta?: { ipAddress?: string; userAgent?: string }) {
    // 1. Fetch user by email with identity and roles
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        identity: true,
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
    });

    if (!user) {
      throw {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      };
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw {
        statusCode: 403,
        code: 'ACCOUNT_INACTIVE',
        message: `Your account is ${user.status.toLowerCase()}. Please contact an administrator.`,
      };
    }

    // 2. Verify password with Argon2id
    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      };
    }

    // 3. Extract roles and permissions
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name)
        )
      )
    );

    // 4. Record Audit Event for Login
    await prisma.auditEvent.create({
      data: {
        action: 'USER_LOGIN',
        entity: 'USER',
        entityId: user.id,
        actorId: user.id,
        ipAddress: clientMeta?.ipAddress || null,
        userAgent: clientMeta?.userAgent || null,
        metadata: {
          email: user.email,
          did: user.identity?.did,
          roles,
        },
      },
    });

    // 5. Sign Token
    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      identityId: user.identity?.id,
      did: user.identity?.did,
      roles,
    };

    const token = signToken(tokenPayload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
        },
        identity: user.identity
          ? {
              id: user.identity.id,
              did: user.identity.did,
              walletAddress: user.identity.walletAddress,
              status: user.identity.status,
              verificationStatus: user.identity.verificationStatus,
            }
          : null,
        roles,
        permissions,
      },
    };
  }

  /**
   * Retrieve full current user profile, cryptographic identity, and assigned permissions
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        identity: true,
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
    });

    if (!user) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User account not found.',
      };
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name)
        )
      )
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
      },
      identity: user.identity
        ? {
            id: user.identity.id,
            did: user.identity.did,
            walletAddress: user.identity.walletAddress,
            status: user.identity.status,
            verificationStatus: user.identity.verificationStatus,
            createdAt: user.identity.createdAt,
          }
        : null,
      roles,
      permissions,
    };
  }

  /**
   * Log user logout in audit trail
   */
  async logout(userId: string, clientMeta?: { ipAddress?: string; userAgent?: string }) {
    await prisma.auditEvent.create({
      data: {
        action: 'USER_LOGOUT',
        entity: 'USER',
        entityId: userId,
        actorId: userId,
        ipAddress: clientMeta?.ipAddress || null,
        userAgent: clientMeta?.userAgent || null,
      },
    });
    return { success: true };
  }
}

export const authService = new AuthService();
