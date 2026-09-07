import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address format' })
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
  firstName: z
    .string()
    .trim()
    .max(50, { message: 'First name is too long' })
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .trim()
    .max(50, { message: 'Last name is too long' })
    .optional()
    .or(z.literal('')),
  organizationName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid Aptos wallet address format (must be 66-character hex 0x...)' })
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address format' })
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password cannot be empty' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
