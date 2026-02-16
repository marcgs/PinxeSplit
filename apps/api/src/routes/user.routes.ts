import { Router } from 'express';
import { getCurrentUser, updateCurrentUser } from '../controllers/user.controller.js';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  defaultCurrency: z.string().optional(),
});

// Get current user's profile (requires authentication)
router.get('/me', authGuard, getCurrentUser);

// Update current user's profile (requires authentication)
router.patch('/me', authGuard, validate(updateUserSchema), updateCurrentUser);

export default router;
