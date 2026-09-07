import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthTokenPayload } from '../utils/security.js';

// Extend Express Request interface to carry authenticated user context
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/**
 * Authentication middleware enforcing valid Bearer JWT tokens
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token missing or invalid format (Bearer token required).',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Session token has expired or is invalid.',
      },
    });
    return;
  }

  // Attach verified user payload to request
  req.user = payload;
  next();
};
