import { MINOR_UNIT_SCALE, type CurrencyCode } from '@pinxesplit/shared';

/**
 * Get the currency scale (minor unit) for a given currency code
 * @param currency The currency code (e.g., 'USD', 'JPY')
 * @returns The scale (100 for most, 1 for JPY/KRW/VND, 1000 for BHD/JOD/KWD)
 */
export function getCurrencyScale(currency: string): number {
  return MINOR_UNIT_SCALE[currency as CurrencyCode] ?? 100;
}
