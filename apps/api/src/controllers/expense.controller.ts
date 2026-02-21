import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

/**
 * Create a new expense with splits
 * POST /api/v1/groups/:id/expenses
 */
export async function createExpense(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const groupId = req.params.id;
    const { description, amount, currency, paidById, categoryId, date, splits } = req.body;

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

    // Get group to verify it's not deleted and get its currency
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        deletedAt: null,
      },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Verify all split userIds are active group members
    const groupMemberIds = group.members.map((m: { userId: string }) => m.userId);
    const splitUserIds = splits.map((split: { userId: string }) => split.userId);
    const invalidUserIds = splitUserIds.filter((userId: string) => !groupMemberIds.includes(userId));

    if (invalidUserIds.length > 0) {
      res.status(400).json({
        error: 'Invalid split: all users must be active group members',
        invalidUserIds,
      });
      return;
    }

    // Check for duplicate userIds in splits
    const uniqueUserIds = new Set(splitUserIds);
    if (uniqueUserIds.size !== splitUserIds.length) {
      res.status(400).json({
        error: 'Invalid split: duplicate user IDs are not allowed',
      });
      return;
    }

    // Verify paidById is a group member
    if (!groupMemberIds.includes(paidById)) {
      res.status(400).json({ error: 'Payer must be a group member' });
      return;
    }

    // Validate split sums equal expense amount
    const totalPaidShare = splits.reduce((sum: number, split: { paidShare: number }) => sum + split.paidShare, 0);
    const totalOwedShare = splits.reduce((sum: number, split: { owedShare: number }) => sum + split.owedShare, 0);

    if (totalPaidShare !== amount) {
      res.status(400).json({
        error: `Split validation failed: sum of paidShare (${totalPaidShare}) must equal expense amount (${amount})`,
      });
      return;
    }

    if (totalOwedShare !== amount) {
      res.status(400).json({
        error: `Split validation failed: sum of owedShare (${totalOwedShare}) must equal expense amount (${amount})`,
      });
      return;
    }

    // Create expense with splits in transaction
    const expense = await prisma.$transaction(async (tx: typeof prisma) => {
      const newExpense = await tx.expense.create({
        data: {
          groupId,
          description,
          amount,
          currency: currency && currency !== group.currency 
            ? (() => { throw new Error(`Currency must match group currency (${group.currency})`); })()
            : (currency || group.currency),
          paidById,
          categoryId: categoryId || null,
          date: date ? new Date(date) : new Date(),
          splits: {
            create: splits.map((split: { userId: string; paidShare: number; owedShare: number; percentage?: number }) => ({
              userId: split.userId,
              amount: split.owedShare, // Store owedShare as the split amount
              percentage: split.percentage ?? null,
            })),
          },
        },
        include: {
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          paidBy: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
        },
      });

      return newExpense;
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all expenses for a group (paginated)
 * GET /api/v1/groups/:id/expenses
 */
export async function getExpenses(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const groupId = req.params.id;
    
    // Validate pagination parameters
    const rawPage = req.query.page as string | undefined;
    const rawLimit = req.query.limit as string | undefined;
    
    let page = 1;
    let limit = 20;
    const MAX_LIMIT = 100;
    
    if (rawPage !== undefined) {
      const parsedPage = parseInt(rawPage, 10);
      if (Number.isNaN(parsedPage) || parsedPage <= 0) {
        res.status(400).json({ error: 'Invalid page parameter' });
        return;
      }
      page = parsedPage;
    }
    
    if (rawLimit !== undefined) {
      const parsedLimit = parseInt(rawLimit, 10);
      if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
        res.status(400).json({ error: 'Invalid limit parameter' });
        return;
      }
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }
    
    const skip = (page - 1) * limit;

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

    // Get expenses (exclude soft-deleted expenses and groups)
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: {
          groupId,
          deletedAt: null,
          group: {
            deletedAt: null,
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
        include: {
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          paidBy: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
        },
      }),
      prisma.expense.count({
        where: {
          groupId,
          deletedAt: null,
          group: {
            deletedAt: null,
          },
        },
      }),
    ]);

    res.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single expense by ID
 * GET /api/v1/expenses/:id
 */
export async function getExpense(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const expenseId = req.params.id;

    // Get expense with group membership check
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        deletedAt: null,
        group: {
          deletedAt: null,
          members: {
            some: {
              userId: req.user.userId,
            },
          },
        },
      },
      include: {
        splits: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        paidBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        group: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an expense
 * PATCH /api/v1/expenses/:id
 */
export async function updateExpense(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const expenseId = req.params.id;
    const { description, amount, currency, paidById, categoryId, date, splits } = req.body;

    // Get existing expense and verify user is a group member
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        deletedAt: null,
        group: {
          deletedAt: null,
          members: {
            some: {
              userId: req.user.userId,
            },
          },
        },
      },
      include: {
        group: {
          include: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!existingExpense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // If splits are being updated, validate them
    if (splits) {
      const groupMemberIds = existingExpense.group.members.map((m: { userId: string }) => m.userId);
      const splitUserIds = splits.map((split: { userId: string }) => split.userId);
      const invalidUserIds = splitUserIds.filter((userId: string) => !groupMemberIds.includes(userId));

      if (invalidUserIds.length > 0) {
        res.status(400).json({
          error: 'Invalid split: all users must be active group members',
          invalidUserIds,
        });
        return;
      }

      // Check for duplicate userIds in splits
      const uniqueUserIds = new Set(splitUserIds);
      if (uniqueUserIds.size !== splitUserIds.length) {
        res.status(400).json({
          error: 'Invalid split: duplicate user IDs are not allowed',
        });
        return;
      }

      // Validate split sums
      const newAmount = amount !== undefined ? amount : existingExpense.amount;
      const totalPaidShare = splits.reduce((sum: number, split: { paidShare: number }) => sum + split.paidShare, 0);
      const totalOwedShare = splits.reduce((sum: number, split: { owedShare: number }) => sum + split.owedShare, 0);

      if (totalPaidShare !== newAmount) {
        res.status(400).json({
          error: `Split validation failed: sum of paidShare (${totalPaidShare}) must equal expense amount (${newAmount})`,
        });
        return;
      }

      if (totalOwedShare !== newAmount) {
        res.status(400).json({
          error: `Split validation failed: sum of owedShare (${totalOwedShare}) must equal expense amount (${newAmount})`,
        });
        return;
      }
    }

    // If amount is being changed without splits, reject the request
    if (amount !== undefined && amount !== existingExpense.amount && !splits) {
      res.status(400).json({
        error: 'Cannot change amount without providing new splits that sum to the new amount',
      });
      return;
    }

    // Validate currency matches group currency if provided
    if (currency !== undefined && currency !== existingExpense.group.currency) {
      res.status(400).json({
        error: `Currency must match group currency (${existingExpense.group.currency})`,
      });
      return;
    }

    // Verify paidById is a group member if provided
    if (paidById) {
      const groupMemberIds = existingExpense.group.members.map((m: { userId: string }) => m.userId);
      if (!groupMemberIds.includes(paidById)) {
        res.status(400).json({ error: 'Payer must be a group member' });
        return;
      }
    }

    // Update expense with atomic split replacement
    const updatedExpense = await prisma.$transaction(async (tx: typeof prisma) => {
      // If splits are being updated, delete old splits first
      if (splits) {
        await tx.expenseSplit.deleteMany({
          where: {
            expenseId,
          },
        });
      }

      // Update expense
      const updated = await tx.expense.update({
        where: { id: expenseId },
        data: {
          ...(description !== undefined && { description }),
          ...(amount !== undefined && { amount }),
          ...(currency !== undefined && { currency }),
          ...(paidById !== undefined && { paidById }),
          ...(categoryId !== undefined && { categoryId }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(splits && {
            splits: {
              create: splits.map((split: { userId: string; paidShare: number; owedShare: number; percentage?: number }) => ({
                userId: split.userId,
                amount: split.owedShare,
                percentage: split.percentage ?? null,
              })),
            },
          }),
        },
        include: {
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          paidBy: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
          group: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
      });

      return updated;
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Soft delete an expense
 * DELETE /api/v1/expenses/:id
 */
export async function deleteExpense(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const expenseId = req.params.id;

    // Verify user is a member of the expense's group
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        deletedAt: null,
        group: {
          deletedAt: null,
          members: {
            some: {
              userId: req.user.userId,
            },
          },
        },
      },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Soft delete the expense
    await prisma.expense.update({
      where: { id: expenseId },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
