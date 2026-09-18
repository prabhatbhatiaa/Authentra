export interface AdminUserRole {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
}

export interface AdminUserIdentity {
  id: string;
  did: string;
  walletAddress: string;
  status: string;
  verificationStatus: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
  identity: AdminUserIdentity | null;
  roles: AdminUserRole[];
}

export interface AdminPermissionItem {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  createdAt: string;
}

export interface AdminRoleItem {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: AdminPermissionItem[];
}

export interface AdminPermissionsResponse {
  total: number;
  permissions: AdminPermissionItem[];
  byCategory: Record<string, AdminPermissionItem[]>;
}
