import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.js';
import { generateTokens } from '../services/token.service.js';
import { env } from '../config/env.js';

/**
 * OAuth Controller
 * Handles Google and Apple OAuth authentication flows
 */

/**
 * Initiate Google OAuth flow
 */
export function googleAuth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
}

/**
 * Handle Google OAuth callback
 */
export async function googleCallback(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', { session: false }, async (err: Error, user: any) => {
    try {
      if (err || !user) {
        console.error('Google OAuth error:', err);
        // Redirect to login page with error
        return res.redirect(`${env.CORS_ORIGIN}/login?error=oauth_failed`);
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateTokens(user.id, user.email);

      // Redirect to frontend with tokens
      // NOTE: Passing tokens in URL is not secure for production
      // Consider using secure httpOnly cookies or one-time codes
      res.redirect(
        `${env.CORS_ORIGIN}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
  })(req, res, next);
}

/**
 * Initiate Apple OAuth flow
 */
export function appleAuth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('apple', {
    scope: ['email', 'name'],
  })(req, res, next);
}

/**
 * Handle Apple OAuth callback
 */
export async function appleCallback(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('apple', { session: false }, async (err: Error, user: any) => {
    try {
      if (err || !user) {
        console.error('Apple OAuth error:', err);
        // Redirect to login page with error
        return res.redirect(`${env.CORS_ORIGIN}/login?error=oauth_failed`);
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateTokens(user.id, user.email);

      // Redirect to frontend with tokens
      // NOTE: Passing tokens in URL is not secure for production
      // Consider using secure httpOnly cookies or one-time codes
      res.redirect(
        `${env.CORS_ORIGIN}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      console.error('Error in Apple callback:', error);
      res.redirect(`${env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
  })(req, res, next);
}
