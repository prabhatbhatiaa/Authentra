import { prisma } from '../config/db.js';
import { UserStatus } from '@prisma/client';

export class AdminService {
  /**
   * List all users within the organization with their identities and assigned roles
   */
  async listUsers(organizationId: string) {
    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        identity: {
          select: {
            id: true,
            did: true,
            walletAddress: true,
            status: true,
            verificationStatus: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      status: u.status,
      createdAt: u.createdAt,
      identity: u.identity,
      roles: u.userRoles.map((ur) => ur.role),
    }));
  }

  /**
   * List all available roles with assigned permissions
   */
  async listRoles(organizationId: string) {
    const roles = await prisma.role.findMany({
      where: {
        OR: [{ organizationId }, { organizationId: null }],
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count.userRoles,
      permissions: r.rolePermissions.map((rp) => rp.permission),
    }));
  }

  /**
   * List all system permissions categorized
   */
  async listPermissions() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Group by category
    const categorized: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      if (!categorized[p.category]) {
        categorized[p.category] = [];
      }
      categorized[p.category].push(p);
    }

    return {
      total: permissions.length,
      permissions,
      byCategory: categorized,
    };
  }

  /**
   * Assign a role to a user.
   * Rule: Users cannot modify their own privileges.
   */
  async assignRole(
    actorId: string,
    targetUserId: string,
    roleId: string,
    clientMeta?: { ipAddress?: string; userAgent?: string }
  ) {
    if (actorId === targetUserId) {
      throw {
        statusCode: 400,
        code: 'SELF_PRIVILEGE_MODIFICATION_PROHIBITED',
        message: 'Security policy: You cannot modify your own roles or privileges.',
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'Target user account not found.',
      };
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw {
        statusCode: 404,
        code: 'ROLE_NOT_FOUND',
        message: 'Role not found.',
      };
    }

    // Check if already assigned
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: targetUserId,
          roleId,
        },
      },
    });

    if (existing) {
      throw {
        statusCode: 409,
        code: 'ROLE_ALREADY_ASSIGNED',
        message: `Role ${role.name} is already assigned to this user.`,
      };
    }

    await prisma.userRole.create({
      data: {
        userId: targetUserId,
        roleId,
      },
    });

    // Record Audit Event
    await prisma.auditEvent.create({
      data: {
        action: 'ROLE_ASSIGNED',
        entity: 'USER_ROLE',
        entityId: targetUserId,
        actorId,
        ipAddress: clientMeta?.ipAddress || null,
        userAgent: clientMeta?.userAgent || null,
        metadata: {
          targetUserId,
          targetEmail: targetUser.email,
          roleId: role.id,
          roleName: role.name,
        },
      },
    });

    return { success: true, message: `Role ${role.name} assigned successfully.` };
  }

  /**
   * Revoke a role from a user.
   * Rule: Users cannot modify their own privileges.
   */
  async revokeRole(
    actorId: string,
    targetUserId: string,
    roleId: string,
    clientMeta?: { ipAddress?: string; userAgent?: string }
  ) {
    if (actorId === targetUserId) {
      throw {
        statusCode: 400,
        code: 'SELF_PRIVILEGE_MODIFICATION_PROHIBITED',
        message: 'Security policy: You cannot modify your own roles or privileges.',
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'Target user account not found.',
      };
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw {
        statusCode: 404,
        code: 'ROLE_NOT_FOUND',
        message: 'Role not found.',
      };
    }

    // Find assignment
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: targetUserId,
          roleId,
        },
      },
    });

    if (!existing) {
      throw {
        statusCode: 404,
        code: 'ROLE_NOT_ASSIGNED',
        message: `User does not have role ${role.name} assigned.`,
      };
    }

    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: targetUserId,
          roleId,
        },
      },
    });

    // Record Audit Event
    await prisma.auditEvent.create({
      data: {
        action: 'ROLE_REVOKED',
        entity: 'USER_ROLE',
        entityId: targetUserId,
        actorId,
        ipAddress: clientMeta?.ipAddress || null,
        userAgent: clientMeta?.userAgent || null,
        metadata: {
          targetUserId,
          targetEmail: targetUser.email,
          roleId: role.id,
          roleName: role.name,
        },
      },
    });

    return { success: true, message: `Role ${role.name} revoked successfully.` };
  }

  /**
   * Update user account status (e.g. ACTIVE, SUSPENDED, DEACTIVATED)
   */
  async updateUserStatus(
    actorId: string,
    targetUserId: string,
    status: UserStatus,
    reason?: string,
    clientMeta?: { ipAddress?: string; userAgent?: string }
  ) {
    if (actorId === targetUserId) {
      throw {
        statusCode: 400,
        code: 'SELF_MODIFICATION_PROHIBITED',
        message: 'Security policy: You cannot change your own account status.',
      };
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status },
    });

    await prisma.auditEvent.create({
      data: {
        action: 'USER_STATUS_UPDATED',
        entity: 'USER',
        entityId: targetUserId,
        actorId,
        ipAddress: clientMeta?.ipAddress || null,
        userAgent: clientMeta?.userAgent || null,
        metadata: {
          newStatus: status,
          reason,
        },
      },
    });

    return updated;
  }
}

export const adminService = new AdminService();
