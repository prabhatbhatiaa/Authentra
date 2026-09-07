import { ApiResponse, AuthResponse, UserProfile } from '../types/auth.types';

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

export const authClient = {
  async register(payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    walletAddress?: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<{ success: boolean; data: { user: UserProfile } }> {
    return request<{ success: boolean; data: { user: UserProfile } }>('/api/auth/me', {
      method: 'GET',
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('authentra_token');
      localStorage.removeItem('authentra_user');
      window.dispatchEvent(new Event('authentra_auth_change'));
    }
  },
};
