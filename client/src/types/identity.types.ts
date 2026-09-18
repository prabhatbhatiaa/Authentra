export interface DidDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    blockchainAccountId: string;
  }>;
  authentication: string[];
  assertionMethod: string[];
}

export interface DetailedIdentity {
  id: string;
  did: string;
  walletAddress: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  verificationStatus: 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    roles: string[];
    permissions: string[];
  };
  stats: {
    ownedAssetsCount: number;
    ownershipHistoryCount: number;
  };
  didDocument: DidDocument;
}

export interface ResolveIdentityResponse {
  id: string;
  did: string;
  walletAddress: string;
  status: string;
  verificationStatus: string;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  roles: string[];
  activeAssetsCount: number;
}
