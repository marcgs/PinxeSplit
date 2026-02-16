import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication guard middleware
 * Validates JWT access token and attaches user info to request
 */
export const authGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({ error: 'Unauthorized: Token expired' });
        return;
      }
      if (error.message === 'Invalid token') {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
};
