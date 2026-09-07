import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Hash password securely with Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: config.env === 'test' ? 4096 : 65536,
    timeCost: config.env === 'test' ? 1 : 3,
    parallelism: 1,
  });
}

/**
 * Verify password against Argon2id hash
 */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  identityId?: string;
  did?: string;
  roles: string[];
}

/**
 * Sign JWT session token
 */
export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
    issuer: 'authentra-api',
    audience: 'authentra-client',
  });
}

/**
 * Verify and decode JWT session token
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'authentra-api',
      audience: 'authentra-client',
    }) as AuthTokenPayload;
  } catch {
    return null;
  }
}
