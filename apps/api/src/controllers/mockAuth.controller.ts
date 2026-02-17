import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { generateAccessToken, generateRefreshToken } from '../services/token.service.js';

/**
 * Mock login endpoint for development
 * POST /api/v1/auth/mock
 * Only available when ENABLE_MOCK_AUTH=true
 */
export async function mockLogin(req: Request, res: Response): Promise<void> {
  try {
    // Check if mock auth is enabled
    if (!env.ENABLE_MOCK_AUTH) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Create new mock user
      const namePart = email.split('@')[0];
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          firstName: name,
          authProvider: 'mock',
        },
      });
    }
    
    // Verify user is mock auth
    if (user.authProvider !== 'mock') {
      res.status(403).json({ error: 'This email is not registered for mock authentication' });
      return;
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await generateRefreshToken(user.id, user.email);
    
    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        defaultCurrency: user.defaultCurrency,
      },
    });
  } catch (error) {
    console.error('Error in mock login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Check if mock auth is available
 * GET /api/v1/auth/mock/status
 */
export function mockAuthStatus(_req: Request, res: Response): void {
  res.status(200).json({
    enabled: env.ENABLE_MOCK_AUTH,
  });
}
