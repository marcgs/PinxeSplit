import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { CURRENCY_CODES } from '@pinxesplit/shared';

/**
 * Get current user's profile
 * GET /api/v1/users/me
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        avatar: true,
        defaultCurrency: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update current user's profile
 * PATCH /api/v1/users/me
 */
export async function updateCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { firstName, lastName, avatar, defaultCurrency } = req.body;
    
    // Validate currency code if provided
    if (defaultCurrency && !CURRENCY_CODES.includes(defaultCurrency)) {
      res.status(400).json({ 
        error: 'Invalid currency code',
        validCurrencies: CURRENCY_CODES,
      });
      return;
    }
    
    // Build update data
    const updateData: {
      firstName?: string;
      lastName?: string;
      name?: string;
      avatar?: string;
      defaultCurrency?: string;
    } = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (defaultCurrency !== undefined) updateData.defaultCurrency = defaultCurrency;
    
    // Update name if firstName or lastName changed
    if (firstName !== undefined || lastName !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });
      
      if (currentUser) {
        const newFirstName = firstName !== undefined ? firstName : currentUser.firstName;
        const newLastName = lastName !== undefined ? lastName : currentUser.lastName;
        
        if (newFirstName && newLastName) {
          updateData.name = `${newFirstName} ${newLastName}`;
        } else if (newFirstName) {
          updateData.name = newFirstName;
        } else if (newLastName) {
          updateData.name = newLastName;
        }
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        avatar: true,
        defaultCurrency: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
