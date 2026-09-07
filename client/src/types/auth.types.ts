export interface UserIdentity {
  id: string;
  did: string;
  walletAddress: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  verificationStatus: 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  createdAt?: string;
}

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status?: string;
  organization: UserOrganization;
  identity: UserIdentity | null;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: UserProfile;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
