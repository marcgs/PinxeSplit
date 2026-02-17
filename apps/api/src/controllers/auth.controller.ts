import type { Request, Response } from 'express';
import { verifyRefreshToken, generateAccessToken, revokeRefreshToken } from '../services/token.service.js';
import { prisma } from '../config/prisma.js';

/**
 * Refresh access token using refresh token
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }
    
    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email);
    
    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Token expired') || 
          error.message.includes('Token not found') || 
          error.message.includes('revoked')) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
      }
    }
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Logout - revoke refresh token
 * POST /api/v1/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
