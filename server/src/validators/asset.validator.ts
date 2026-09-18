import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  assetType: z.string().min(2, 'Asset type is required').default('SECURITY_TOKEN'),
  metadata: z.record(z.any()).optional(),
});

export const assignAssetSchema = z.object({
  targetIdentityId: z.string().uuid('Valid target identity ID is required'),
  notes: z.string().max(300).optional(),
});

export const transferAssetSchema = z.object({
  targetIdentityId: z.string().uuid('Valid target identity ID is required'),
  reason: z.string().min(3, 'Transfer reason is required').max(300),
});

export const revokeAssetSchema = z.object({
  reason: z.string().min(3, 'Revocation reason is required').max(300),
});
