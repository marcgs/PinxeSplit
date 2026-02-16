// Currency types and constants
export const CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'INR', 'MXN'
] as const;

export type CurrencyCode = typeof CURRENCY_CODES[number];

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

// Minor unit scale for currency (e.g., 100 cents = 1 dollar)
export const MINOR_UNIT_SCALE: Record<CurrencyCode, number> = {
  USD: 100,
  EUR: 100,
  GBP: 100,
  CHF: 100,
  AUD: 100,
  CAD: 100,
  CNY: 100,
  INR: 100,
  MXN: 100,
  JPY: 1, // Japanese Yen has no minor unit
};

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: CurrencyCode;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

// Expense types
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // In minor units (e.g., cents)
  currency: CurrencyCode;
  paidById: string;
  category?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // In minor units
  percentage?: number;
}

export type SplitType = 'equal' | 'percentage' | 'exact' | 'shares';

// Balance types
export interface Balance {
  userId: string;
  groupId: string;
  amount: number; // In minor units (positive = owed to them, negative = they owe)
  currency: CurrencyCode;
}

export interface Settlement {
  from: string; // userId
  to: string; // userId
  amount: number; // In minor units
  currency: CurrencyCode;
}
