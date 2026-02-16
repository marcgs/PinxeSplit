import { MINOR_UNIT_SCALE, type CurrencyCode } from '../types/index.js';

/**
 * Convert amount from minor units (e.g., cents) to major units (e.g., dollars)
 */
export function fromMinorUnits(amount: number, currency: CurrencyCode): number {
  const scale = MINOR_UNIT_SCALE[currency];
  return amount / scale;
}

/**
 * Convert amount from major units (e.g., dollars) to minor units (e.g., cents)
 */
export function toMinorUnits(amount: number, currency: CurrencyCode): number {
  const scale = MINOR_UNIT_SCALE[currency];
  return Math.round(amount * scale);
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const majorUnits = fromMinorUnits(amount, currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(majorUnits);
}
