// Currency types and constants
export const CURRENCY_CODES = [
  // Major currencies
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'INR', 'MXN',
  // Americas
  'ARS', 'BRL', 'CLP', 'COP', 'CRC', 'DOP', 'GTQ', 'HNL', 'JMD', 'PAB', 'PEN', 'TTD', 'UYU', 'VES',
  // Europe
  'ALL', 'BAM', 'BGN', 'CZK', 'DKK', 'HRK', 'HUF', 'ISK', 'MDL', 'MKD', 'NOK', 'PLN', 'RON', 'RSD', 'RUB', 'SEK', 'TRY', 'UAH',
  // Asia-Pacific
  'AED', 'AFN', 'AMD', 'AZN', 'BDT', 'BHD', 'BND', 'GEL', 'HKD', 'IDR', 'ILS', 'IQD', 'IRR', 'JOD', 'KHR', 'KRW', 'KWD', 'KZT',
  'LAK', 'LBP', 'LKR', 'MMK', 'MNT', 'MOP', 'MVR', 'MYR', 'NPR', 'OMR', 'PHP', 'PKR', 'QAR', 'SAR', 'SGD', 'SYP', 'THB', 'TJS',
  'TMT', 'TWD', 'UZS', 'VND', 'YER',
  // Africa
  'AOA', 'BWP', 'CDF', 'DZD', 'EGP', 'ETB', 'GHS', 'GMD', 'GNF', 'KES', 'LYD', 'MAD', 'MGA', 'MRU', 'MUR', 'MWK', 'MZN', 'NAD',
  'NGN', 'RWF', 'SCR', 'SDG', 'SOS', 'SZL', 'TND', 'TZS', 'UGX', 'XAF', 'XOF', 'ZAR', 'ZMW', 'ZWL',
  // Oceania
  'FJD', 'NZD', 'PGK', 'TOP', 'WST', 'XPF',
  // Additional
  'BBD', 'BMD', 'BOB', 'BSD', 'BYN', 'BZD', 'CVE', 'DJF', 'ERN', 'GYD', 'HTG', 'KGS', 'KPW', 'LRD', 'LSL', 'NIO', 'PYG', 'SBD',
  'SLL', 'SRD', 'STN', 'VUV',
] as const;

export type CurrencyCode = typeof CURRENCY_CODES[number];

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  scale: number;
}

// Minor unit scale for currency (e.g., 100 cents = 1 dollar)
export const MINOR_UNIT_SCALE: Record<CurrencyCode, number> = {
  // Major currencies (100)
  USD: 100, EUR: 100, GBP: 100, CHF: 100, AUD: 100, CAD: 100, CNY: 100, INR: 100, MXN: 100,
  // Americas (100)
  ARS: 100, BRL: 100, COP: 100, CRC: 100, DOP: 100, GTQ: 100, HNL: 100, JMD: 100, PAB: 100, PEN: 100, TTD: 100, UYU: 100, VES: 100,
  // Europe (100)
  ALL: 100, BAM: 100, BGN: 100, CZK: 100, DKK: 100, HRK: 100, HUF: 100, MDL: 100, MKD: 100, NOK: 100, PLN: 100, RON: 100, RSD: 100, RUB: 100, SEK: 100, TRY: 100, UAH: 100,
  // Asia-Pacific (100)
  AED: 100, AFN: 100, AMD: 100, AZN: 100, BDT: 100, BND: 100, GEL: 100, HKD: 100, IDR: 100, ILS: 100, IRR: 100, KHR: 100, KZT: 100, LAK: 100, LBP: 100, LKR: 100, MMK: 100,
  MNT: 100, MOP: 100, MVR: 100, MYR: 100, NPR: 100, PHP: 100, PKR: 100, QAR: 100, SAR: 100, SGD: 100, SYP: 100, THB: 100, TJS: 100, TMT: 100, TWD: 100, UZS: 100, YER: 100,
  // Africa (100)
  AOA: 100, BWP: 100, CDF: 100, DZD: 100, EGP: 100, ETB: 100, GHS: 100, GMD: 100, KES: 100, MAD: 100, MGA: 100, MRU: 100, MUR: 100, MWK: 100, MZN: 100, NAD: 100, NGN: 100,
  SCR: 100, SDG: 100, SOS: 100, SZL: 100, TZS: 100, ZAR: 100, ZMW: 100, ZWL: 100,
  // Oceania (100)
  FJD: 100, NZD: 100, PGK: 100, TOP: 100, WST: 100,
  // Additional (100)
  BBD: 100, BMD: 100, BOB: 100, BSD: 100, BYN: 100, BZD: 100, CVE: 100, ERN: 100, GYD: 100, HTG: 100, KGS: 100, KPW: 100, LRD: 100, LSL: 100, NIO: 100, SBD: 100, SLL: 100, SRD: 100, STN: 100,
  // No minor units (1)
  JPY: 1, KRW: 1, VND: 1, CLP: 1, ISK: 1, GNF: 1, RWF: 1, UGX: 1, XAF: 1, XOF: 1, XPF: 1, DJF: 1, PYG: 1, VUV: 1,
  // 1000 scale (three decimal places)
  BHD: 1000, IQD: 1000, JOD: 1000, KWD: 1000, LYD: 1000, OMR: 1000, TND: 1000,
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
