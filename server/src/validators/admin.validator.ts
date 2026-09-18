import { z } from 'zod';

export const assignRoleSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).uuid({ message: 'Invalid user ID format' }),
  roleId: z.string({ required_error: 'Role ID is required' }).uuid({ message: 'Invalid role ID format' }),
});

export const revokeRoleSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).uuid({ message: 'Invalid user ID format' }),
  roleId: z.string({ required_error: 'Role ID is required' }).uuid({ message: 'Invalid role ID format' }),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid user status',
  }),
  reason: z.string().max(250).optional(),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type RevokeRoleInput = z.infer<typeof revokeRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
