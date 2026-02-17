import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
import { CURRENCY_CODES, type CurrencyCode } from '@pinxesplit/shared';

const router = Router();

// Split schema for expense creation/update
const splitSchema = z.object({
  userId: z.string().uuid(),
  paidShare: z.number().int().min(0), // Amount user paid (in minor units/cents)
  owedShare: z.number().int().min(0), // Amount user owes (in minor units/cents)
  percentage: z.number().int().min(0).max(100).optional(), // For percentage splits
});

const createExpenseSchema = z.object({
  description: z.string().trim().min(1).max(500),
  amount: z.number().int().positive(), // Amount in minor units (cents)
  currency: z
    .string()
    .length(3)
    .refine((code): code is CurrencyCode => CURRENCY_CODES.includes(code as CurrencyCode), {
      message: 'Invalid currency code',
    })
    .optional(),
  paidById: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  date: z.string().datetime().optional(), // ISO 8601 date string
  splits: z.array(splitSchema).min(1),
});

const updateExpenseSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  amount: z.number().int().positive().optional(),
  currency: z
    .string()
    .length(3)
    .refine((code): code is CurrencyCode => CURRENCY_CODES.includes(code as CurrencyCode), {
      message: 'Invalid currency code',
    })
    .optional(),
  paidById: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  date: z.string().datetime().optional(),
  splits: z.array(splitSchema).min(1).optional(),
});

// Create expense for a group
router.post('/groups/:id/expenses', authGuard, validate(createExpenseSchema), createExpense);

// Get all expenses for a group (paginated)
router.get('/groups/:id/expenses', authGuard, getExpenses);

// Get single expense by ID
router.get('/expenses/:id', authGuard, getExpense);

// Update expense
router.patch('/expenses/:id', authGuard, validate(updateExpenseSchema), updateExpense);

// Delete expense (soft delete)
router.delete('/expenses/:id', authGuard, deleteExpense);

export default router;
