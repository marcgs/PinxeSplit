import { Router } from 'express';
import { refreshToken, logout } from '../controllers/auth.controller.js';
import { mockLogin, mockAuthStatus } from '../controllers/mockAuth.controller.js';
import {
  googleAuth,
  googleCallback,
  appleAuth,
  appleCallback,
} from '../controllers/oauth.controller.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

const mockLoginSchema = z.object({
  email: z.string().email(),
});

// Refresh access token
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Logout (revoke refresh token)
router.post('/logout', validate(logoutSchema), logout);

// Mock authentication endpoints (only available when ENABLE_MOCK_AUTH=true)
router.post('/mock', validate(mockLoginSchema), mockLogin);
router.get('/mock/status', mockAuthStatus);

// OAuth routes
// TODO: Add rate limiting middleware to prevent abuse (e.g., express-rate-limit)
// Recommended: 5-10 requests per minute per IP for OAuth initiation
//              2-3 requests per minute per IP for callback endpoints
// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Apple OAuth
router.get('/apple', appleAuth);
router.get('/apple/callback', appleCallback);

export default router;
