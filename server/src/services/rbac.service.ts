import { prisma } from '../config/db.js';

export class RbacService {
  /**
   * Resolve live, effective permissions directly from the database for a given user.
   * Never trusts client-supplied roles or permissions.
   */
  async getUserPermissions(userId: string): Promise<{
    roles: string[];
    permissions: string[];
    organizationId: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return { roles: [], permissions: [], organizationId: '' };
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
      roles,
      permissions,
      organizationId: user.organizationId,
    };
  }

  /**
   * Check whether a user has a specific permission or belongs to ADMIN role
   */
  async hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
    const { roles, permissions } = await this.getUserPermissions(userId);
    // ADMIN has super-user override
    if (roles.includes('ADMIN')) return true;
    return permissions.includes(requiredPermission);
  }

  /**
   * Check whether a user has at least one of multiple permissions
   */
  async hasAnyPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const { roles, permissions } = await this.getUserPermissions(userId);
    if (roles.includes('ADMIN')) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  }
}

export const rbacService = new RbacService();
