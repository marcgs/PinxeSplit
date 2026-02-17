import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

/**
 * Create a new group
 * POST /api/v1/groups
 */
export async function createGroup(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, currency } = req.body;

    // Create group and automatically add creator as member
    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        currency: currency || 'USD',
        createdById: req.user.userId,
        members: {
          create: {
            userId: req.user.userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
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
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all groups for the authenticated user
 * GET /api/v1/groups
 */
export async function getGroups(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get groups where user is an active member and group is not deleted
    const groups = await prisma.group.findMany({
      where: {
        deletedAt: null,
        members: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        members: {
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
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get group by ID
 * GET /api/v1/groups/:id
 */
export async function getGroup(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Find group with members
    const group = await prisma.group.findFirst({
      where: {
        id,
        deletedAt: null,
        members: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        members: {
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
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            expenses: true,
          },
        },
      },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update group
 * PATCH /api/v1/groups/:id
 */
export async function updateGroup(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { name, description, currency } = req.body;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: req.user.userId,
      },
    });

    if (!membership) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if group is deleted
    const existingGroup = await prisma.group.findUnique({
      where: { id },
    });

    if (!existingGroup || existingGroup.deletedAt) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Build update data
    const updateData: {
      name?: string;
      description?: string | null;
      currency?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (currency !== undefined) updateData.currency = currency;

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        members: {
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
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Soft delete group
 * DELETE /api/v1/groups/:id
 */
export async function deleteGroup(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Check if group exists and is not deleted
    const group = await prisma.group.findFirst({
      where: {
        id,
        deletedAt: null,
        members: {
          some: {
            userId: req.user.userId,
          },
        },
      },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Only the creator can delete the group
    if (group.createdById !== req.user.userId) {
      res.status(403).json({ error: 'Only the group creator can delete the group' });
      return;
    }

    // Soft delete the group
    await prisma.group.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Add member to group
 * POST /api/v1/groups/:id/members
 */
export async function addMember(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { email } = req.body;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: req.user.userId,
      },
    });

    if (!membership) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if group is deleted
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group || group.deletedAt) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMembership) {
      res.status(409).json({ error: 'User is already a member of this group' });
      return;
    }

    // Add member
    await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: userToAdd.id,
        role: 'member',
      },
    });

    // Return updated group with members
    const updatedGroup = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
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
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Remove member from group
 * DELETE /api/v1/groups/:id/members/:userId
 */
export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id, userId } = req.params;

    // Check if requesting user is a member of the group
    const requestingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: req.user.userId,
      },
    });

    if (!requestingMember) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if group is deleted
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group || group.deletedAt) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Authorization: only the member themself or an owner can remove a member
    const isSelfRemoval = req.user.userId === userId;
    const canManageMembers = requestingMember.role === 'owner';

    if (!isSelfRemoval && !canManageMembers) {
      res.status(403).json({ error: 'Insufficient permissions to remove this member' });
      return;
    }

    // Check if the member to remove exists in the group
    const memberToRemove = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (!memberToRemove) {
      res.status(404).json({ error: 'Member not found in this group' });
      return;
    }

    // Ensure we don't remove the last remaining member of the group
    const memberCount = await prisma.groupMember.count({
      where: {
        groupId: id,
      },
    });

    if (memberCount <= 1) {
      res.status(409).json({
        error: 'Cannot remove the last remaining member of the group',
      });
      return;
    }

    // Calculate the balance for the member being removed
    // Only consider expenses in the group's currency to avoid mixing currencies
    const memberExpenseSplits = await prisma.expenseSplit.findMany({
      where: {
        userId,
        expense: {
          groupId: id,
          currency: group.currency, // Only expenses matching group currency
        },
      },
      include: {
        expense: {
          select: {
            paidById: true,
            amount: true,
            currency: true,
          },
        },
      },
    });

    const memberExpensesPaid = await prisma.expense.findMany({
      where: {
        groupId: id,
        paidById: userId,
        currency: group.currency, // Only expenses matching group currency
      },
      select: {
        amount: true,
      },
    });

    // Calculate total paid by the member
    const totalPaid = memberExpensesPaid.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0);

    // Calculate total owed by the member (sum of their splits)
    const totalOwed = memberExpenseSplits.reduce((sum: number, split: { amount: number }) => sum + split.amount, 0);

    // Calculate the balance (positive means they owe, negative means they are owed)
    const balance = totalOwed - totalPaid;

    if (balance !== 0) {
      res.status(409).json({
        error: 'Cannot remove member with non-zero balance',
        balance,
      });
      return;
    }

    // Remove member
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
