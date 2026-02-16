import { Router } from 'express';
import { refreshToken, logout } from '../controllers/auth.controller.js';
import { mockLogin, mockAuthStatus } from '../controllers/mockAuth.controller.js';
import { googleAuth, googleCallback, appleAuth, appleCallback } from '../controllers/oauth.controller.js';
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

// OAuth endpoints
// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Apple Sign-In
router.post('/apple', appleAuth);
router.post('/apple/callback', appleCallback);

export default router;
