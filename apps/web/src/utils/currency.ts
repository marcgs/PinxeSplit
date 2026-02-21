import { MINOR_UNIT_SCALE, type CurrencyCode } from '@pinxesplit/shared';

/**
 * Get the currency scale (minor unit) for a given currency code
 * @param currency The currency code (e.g., 'USD', 'JPY')
 * @returns The scale (100 for most, 1 for JPY/KRW/VND, 1000 for BHD/JOD/KWD)
 */
export function getCurrencyScale(currency: string): number {
  return MINOR_UNIT_SCALE[currency as CurrencyCode] ?? 100;
}

/**
 * Format a minor-unit amount as a display string with currency code.
 * e.g. formatCurrencyAmount(1050, 'USD') → 'USD 10.50'
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  const scale = getCurrencyScale(currency);
  const abs = Math.abs(amount) / scale;
  const decimals = scale === 1 ? 0 : scale === 1000 ? 3 : 2;
  return `${currency} ${abs.toFixed(decimals)}`;
}
