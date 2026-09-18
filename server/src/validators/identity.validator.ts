import { z } from 'zod';

export const updateIdentityStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid identity status',
  }),
  reason: z.string().max(250).optional(),
});

export const updateVerificationStatusSchema = z.object({
  verificationStatus: z.enum(['UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'], {
    required_error: 'Verification status is required',
    invalid_type_error: 'Invalid verification status',
  }),
  notes: z.string().max(250).optional(),
});

export type UpdateIdentityStatusInput = z.infer<typeof updateIdentityStatusSchema>;
export type UpdateVerificationStatusInput = z.infer<typeof updateVerificationStatusSchema>;
