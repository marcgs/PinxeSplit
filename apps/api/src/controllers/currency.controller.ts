import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all currencies sorted alphabetically by code
 */
export async function getCurrencies(req: Request, res: Response) {
  try {
    const currencies = await prisma.currency.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    res.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
}
