import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { getGroupBalances, getOverallBalances } from '../services/balance.service.js';
import type { PrismaClient } from '@prisma/client';

/**
 * GET /api/v1/groups/:id/balances
 * Returns { balances, debts, simplifiedDebts } for a group
 */
export async function getGroupBalancesHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id: groupId } = req.params;

    // Verify user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Verify group exists and is not deleted
    const group = await prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const result = await getGroupBalances(groupId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching group balances:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/v1/balances
 * Returns overall balances for the authenticated user across all groups
 */
export async function getOverallBalancesHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const balances = await getOverallBalances(req.user.userId);
    res.json({ balances });
  } catch (error) {
    console.error('Error fetching overall balances:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/v1/groups/:id/settle
 * Body: { toUserId, amount, currencyCode }
 * Creates a payment expense to record a settlement between two users.
 */
export async function settleUp(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id: groupId } = req.params;
    const { toUserId, amount, currencyCode } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Amount must be positive' });
      return;
    }

    // Verify both users are members of the group
    const [fromMembership, toMembership] = await Promise.all([
      prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId: req.user.userId },
        },
      }),
      prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId: toUserId },
        },
      }),
    ]);

    if (!fromMembership) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    if (!toMembership) {
      res.status(400).json({ error: 'Recipient is not a member of this group' });
      return;
    }

    // Verify group exists and is not deleted
    const group = await prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const currency = currencyCode || group.currency;

    // Create payment expense with two splits
    const expense = await prisma.$transaction(async (tx: PrismaClient) => {
      const newExpense = await tx.expense.create({
        data: {
          groupId,
          description: 'Payment',
          amount,
          currency,
          paidById: req.user!.userId,
          isPayment: true,
          date: new Date(),
          splits: {
            create: [
              {
                // Payer: paid amount, owes nothing
                userId: req.user!.userId,
                amount: 0, // owedShare = 0
              },
              {
                // Recipient: owes the full amount (they received the money)
                userId: toUserId,
                amount, // owedShare = amount (the settlement cancels their debt)
              },
            ],
          },
        },
        include: {
          splits: {
            include: {
              user: {
                select: { id: true, email: true, name: true, avatar: true },
              },
            },
          },
          paidBy: {
            select: { id: true, email: true, name: true, avatar: true },
          },
        },
      });

      return newExpense;
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error settling up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
