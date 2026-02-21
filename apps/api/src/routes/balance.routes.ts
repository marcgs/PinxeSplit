import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
import { CURRENCY_CODES, type CurrencyCode } from '@pinxesplit/shared';
import {
  getGroupBalancesHandler,
  getOverallBalancesHandler,
  settleUp,
} from '../controllers/balance.controller.js';

const router = Router();

const balanceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const settleUpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const settleUpSchema = z.object({
  toUserId: z.string().uuid(),
  amount: z.number().int().positive(),
  currencyCode: z
    .string()
    .length(3)
    .refine((code): code is CurrencyCode => CURRENCY_CODES.includes(code as CurrencyCode), {
      message: 'Invalid currency code',
    })
    .optional(),
});

// Get balances for a group
router.get('/groups/:id/balances', balanceLimiter, authGuard, getGroupBalancesHandler);

// Settle up within a group
router.post('/groups/:id/settle', settleUpLimiter, authGuard, validate(settleUpSchema), settleUp);

// Get overall balances for the authenticated user
router.get('/balances', balanceLimiter, authGuard, getOverallBalancesHandler);

export default router;
