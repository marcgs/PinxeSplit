import type { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.js';
import { generateAccessToken, generateRefreshToken } from '../services/token.service.js';
import { prisma } from '../config/prisma.js';

/**
 * Google OAuth 2.0 login handler
 * POST /api/v1/auth/google
 * 
 * Expects authorization code from client-side OAuth flow.
 * This endpoint handles the server-side token exchange.
 */
export function googleAuth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('google', { session: false }, async (err: Error | null, expressUser: Express.User) => {
    try {
      if (err) {
        res.status(401).json({ error: err.message || 'Authentication failed' });
        return;
      }
      
      if (!expressUser) {
        res.status(401).json({ error: 'Authentication failed' });
        return;
      }
      
      // Fetch full user from database
      const user = await prisma.user.findUnique({
        where: { id: expressUser.userId },
      });
      
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      
      // Generate JWT tokens
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
      console.error('Error in Google auth:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })(req, res, next);
}

/**
 * Apple Sign-In login handler
 * POST /api/v1/auth/apple
 * 
 * Expects identity token from client-side Apple Sign-In flow.
 */
export function appleAuth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('apple', { session: false }, async (err: Error | null, expressUser: Express.User) => {
    try {
      if (err) {
        res.status(401).json({ error: err.message || 'Authentication failed' });
        return;
      }
      
      if (!expressUser) {
        res.status(401).json({ error: 'Authentication failed' });
        return;
      }
      
      // Fetch full user from database
      const user = await prisma.user.findUnique({
        where: { id: expressUser.userId },
      });
      
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      
      // Generate JWT tokens
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
      console.error('Error in Apple auth:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })(req, res, next);
}

/**
 * Google OAuth callback handler (for redirect-based flow)
 * GET /api/v1/auth/google/callback
 */
export function googleCallback(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('google', { session: false }, async (err: Error | null, expressUser: Express.User) => {
    try {
      if (err || !expressUser) {
        // Redirect to frontend with error
        res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=auth_failed`);
        return;
      }
      
      // Fetch full user from database
      const user = await prisma.user.findUnique({
        where: { id: expressUser.userId },
      });
      
      if (!user) {
        res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=user_not_found`);
        return;
      }
      
      // Generate JWT tokens
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = await generateRefreshToken(user.id, user.email);
      
      // Redirect to frontend with tokens in URL (for development)
      // In production, you might want to use a more secure method
      res.redirect(
        `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/auth/callback?` +
        `accessToken=${encodeURIComponent(accessToken)}&` +
        `refreshToken=${encodeURIComponent(refreshToken)}`
      );
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=server_error`);
    }
  })(req, res, next);
}

/**
 * Apple OAuth callback handler (for redirect-based flow)
 * POST /api/v1/auth/apple/callback
 */
export function appleCallback(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('apple', { session: false }, async (err: Error | null, expressUser: Express.User) => {
    try {
      if (err || !expressUser) {
        // Redirect to frontend with error
        res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=auth_failed`);
        return;
      }
      
      // Fetch full user from database
      const user = await prisma.user.findUnique({
        where: { id: expressUser.userId },
      });
      
      if (!user) {
        res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=user_not_found`);
        return;
      }
      
      // Generate JWT tokens
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = await generateRefreshToken(user.id, user.email);
      
      // Redirect to frontend with tokens in URL (for development)
      // In production, you might want to use a more secure method
      res.redirect(
        `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/auth/callback?` +
        `accessToken=${encodeURIComponent(accessToken)}&` +
        `refreshToken=${encodeURIComponent(refreshToken)}`
      );
    } catch (error) {
      console.error('Error in Apple callback:', error);
      res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=server_error`);
    }
  })(req, res, next);
}
