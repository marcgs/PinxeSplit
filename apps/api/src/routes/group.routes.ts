import { Router } from 'express';
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
} from '../controllers/group.controller.js';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
import { CURRENCY_CODES, type CurrencyCode } from '@pinxesplit/shared';

const router = Router();

const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  currency: z
    .string()
    .length(3)
    .refine((code): code is CurrencyCode => CURRENCY_CODES.includes(code as CurrencyCode), {
      message: 'Invalid currency code',
    })
    .optional(), // ISO currency code
});

const updateGroupSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  currency: z
    .string()
    .length(3)
    .refine((code): code is CurrencyCode => CURRENCY_CODES.includes(code as CurrencyCode), {
      message: 'Invalid currency code',
    })
    .optional(),
});

const addMemberSchema = z.object({
  email: z.string().email(),
});

// Create a new group
router.post('/', authGuard, validate(createGroupSchema), createGroup);

// Get all groups for authenticated user
router.get('/', authGuard, getGroups);

// Get group by ID
router.get('/:id', authGuard, getGroup);

// Update group
router.patch('/:id', authGuard, validate(updateGroupSchema), updateGroup);

// Soft delete group
router.delete('/:id', authGuard, deleteGroup);

// Add member to group
router.post('/:id/members', authGuard, validate(addMemberSchema), addMember);

// Remove member from group
router.delete('/:id/members/:userId', authGuard, removeMember);

export default router;
