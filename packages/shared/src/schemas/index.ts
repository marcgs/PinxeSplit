import { z } from 'zod';
import { CURRENCY_CODES } from '../types/index.js';

// User schemas
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  currency: z.enum(CURRENCY_CODES),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  currency: z.enum(CURRENCY_CODES).optional(),
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

export const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['admin', 'member']).default('member'),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

// Expense schemas
export const expenseSplitSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive().optional(),
  percentage: z.number().min(0).max(100).optional(),
  shares: z.number().int().positive().optional(),
});

export const createExpenseSchema = z.object({
  groupId: z.string().uuid(),
  description: z.string().min(1).max(200),
  amount: z.number().int().positive(),
  currency: z.enum(CURRENCY_CODES),
  paidById: z.string().uuid(),
  category: z.string().max(50).optional(),
  date: z.string().datetime().or(z.date()).optional(),
  splitType: z.enum(['equal', 'percentage', 'exact', 'shares']),
  splits: z.array(expenseSplitSchema).min(1),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  amount: z.number().int().positive().optional(),
  currency: z.enum(CURRENCY_CODES).optional(),
  paidById: z.string().uuid().optional(),
  category: z.string().max(50).optional(),
  date: z.string().datetime().or(z.date()).optional(),
  splitType: z.enum(['equal', 'percentage', 'exact', 'shares']).optional(),
  splits: z.array(expenseSplitSchema).min(1).optional(),
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// Settlement schemas
export const settleUpSchema = z.object({
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.number().int().positive(),
});

export type SettleUpInput = z.infer<typeof settleUpSchema>;
