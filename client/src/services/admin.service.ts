import { ApiResponse } from '../types/auth.types';
import {
  AdminUserItem,
  AdminRoleItem,
  AdminPermissionsResponse,
} from '../types/admin.types';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('authentra_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data: ApiResponse<any> = await response.json();

  if (!response.ok || !data.success) {
    if (response.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('authentra_token');
      localStorage.removeItem('authentra_user');
      window.dispatchEvent(new Event('authentra_auth_change'));
    }
    let errorMsg = data.error?.message || `HTTP error ${response.status}`;
    if (data.error?.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
      errorMsg = data.error.details.map((d: any) => d.message).join('. ');
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

export const adminClient = {
  async getUsers(): Promise<{ success: boolean; data: { users: AdminUserItem[] } }> {
    return request('/api/admin/users', { method: 'GET' });
  },

  async getRoles(): Promise<{ success: boolean; data: { roles: AdminRoleItem[] } }> {
    return request('/api/admin/roles', { method: 'GET' });
  },

  async getPermissions(): Promise<{ success: boolean; data: AdminPermissionsResponse }> {
    return request('/api/admin/permissions', { method: 'GET' });
  },

  async assignRole(userId: string, roleId: string): Promise<{ success: boolean; message: string }> {
    return request('/api/admin/roles/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  },

  async revokeRole(userId: string, roleId: string): Promise<{ success: boolean; message: string }> {
    return request('/api/admin/roles/revoke', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  },

  async updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED',
    reason?: string
  ): Promise<{ success: boolean; message: string; data: { user: any } }> {
    return request(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },
};
