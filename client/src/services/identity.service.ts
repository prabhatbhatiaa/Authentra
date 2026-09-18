import { ApiResponse } from '../types/auth.types';
import { DetailedIdentity, ResolveIdentityResponse } from '../types/identity.types';

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

export const identityClient = {
  async getMyIdentity(): Promise<{ success: boolean; data: { identity: DetailedIdentity } }> {
    return request('/api/identity/me', { method: 'GET' });
  },

  async resolveDid(did: string): Promise<{ success: boolean; data: { identity: ResolveIdentityResponse } }> {
    return request(`/api/identity/resolve/${encodeURIComponent(did)}`, { method: 'GET' });
  },

  async updateStatus(
    id: string,
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED',
    reason?: string
  ): Promise<{ success: boolean; message: string; data: { identity: any } }> {
    return request(`/api/identity/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  async updateVerification(
    id: string,
    verificationStatus: 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED',
    notes?: string
  ): Promise<{ success: boolean; message: string; data: { identity: any } }> {
    return request(`/api/identity/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verificationStatus, notes }),
    });
  },
};
