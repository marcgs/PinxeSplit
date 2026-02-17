/**
 * Money arithmetic utilities using integer cents (minor units).
 * All calculations use integer arithmetic to avoid floating point errors.
 */

/**
 * Convert amount from major units (e.g., dollars) to cents (minor units)
 */
export function toCents(amount: number, scale: number = 100): number {
  return Math.round(amount * scale);
}

/**
 * Convert amount from cents (minor units) to major units (e.g., dollars)
 */
export function fromCents(amountInCents: number, scale: number = 100): number {
  return amountInCents / scale;
}

/**
 * Split amount evenly among users.
 * Distributes remainder to creator to maintain sum invariant.
 * 
 * @param totalCents - Total amount to split in cents
 * @param userIds - Array of user IDs to split among
 * @param creatorId - ID of the creator who gets any remainder
 * @returns Record mapping user ID to their share in cents
 * 
 * @example
 * splitEvenly(1000, ["a", "b", "c"], "a")
 * // Returns { a: 334, b: 333, c: 333 }
 */
export function splitEvenly(
  totalCents: number,
  userIds: string[],
  creatorId: string
): Record<string, number> {
  if (userIds.length === 0) {
    throw new Error('Cannot split among zero users');
  }

  const baseAmount = Math.floor(totalCents / userIds.length);
  const remainder = totalCents - (baseAmount * userIds.length);

  const result: Record<string, number> = {};
  
  for (const userId of userIds) {
    result[userId] = baseAmount;
  }

  // Give remainder to creator
  if (remainder > 0 && creatorId in result) {
    result[creatorId] += remainder;
  }

  return result;
}

/**
 * Split amount by percentages.
 * Distributes remainder to creator to maintain sum invariant.
 * 
 * @param totalCents - Total amount to split in cents
 * @param percentages - Array of objects with userId and percentage (0-100)
 * @param creatorId - ID of the creator who gets any remainder
 * @returns Record mapping user ID to their share in cents
 * 
 * @example
 * splitByPercentages(10000, [{id: "a", pct: 50}, {id: "b", pct: 30}, {id: "c", pct: 20}], "a")
 * // Returns { a: 5000, b: 3000, c: 2000 }
 */
export function splitByPercentages(
  totalCents: number,
  percentages: Array<{ id: string; pct: number }>,
  creatorId: string
): Record<string, number> {
  const totalPct = percentages.reduce((sum, p) => sum + p.pct, 0);
  
  if (Math.abs(totalPct - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100, got ${totalPct}`);
  }

  const result: Record<string, number> = {};
  let allocatedTotal = 0;

  // Calculate shares using floor division
  for (const { id, pct } of percentages) {
    const share = Math.floor((totalCents * pct) / 100);
    result[id] = share;
    allocatedTotal += share;
  }

  // Give remainder to creator
  const remainder = totalCents - allocatedTotal;
  if (remainder > 0 && creatorId in result) {
    result[creatorId] += remainder;
  }

  return result;
}

/**
 * Split amount by shares (ratios).
 * Distributes remainder to creator to maintain sum invariant.
 * 
 * @param totalCents - Total amount to split in cents
 * @param shares - Array of objects with userId and number of shares
 * @param creatorId - ID of the creator who gets any remainder
 * @returns Record mapping user ID to their share in cents
 * 
 * @example
 * splitByShares(10000, [{id: "a", shares: 2}, {id: "b", shares: 1}], "a")
 * // Returns { a: 6667, b: 3333 }
 */
export function splitByShares(
  totalCents: number,
  shares: Array<{ id: string; shares: number }>,
  creatorId: string
): Record<string, number> {
  const totalShares = shares.reduce((sum, s) => sum + s.shares, 0);
  
  if (totalShares === 0) {
    throw new Error('Total shares cannot be zero');
  }

  const result: Record<string, number> = {};
  let allocatedTotal = 0;

  // Calculate shares using floor division
  for (const { id, shares: userShares } of shares) {
    const share = Math.floor((totalCents * userShares) / totalShares);
    result[id] = share;
    allocatedTotal += share;
  }

  // Give remainder to creator
  const remainder = totalCents - allocatedTotal;
  if (remainder > 0 && creatorId in result) {
    result[creatorId] += remainder;
  }

  return result;
}

/**
 * Split amount by exact amounts.
 * Validates that the sum equals the total.
 * 
 * @param totalCents - Total amount in cents
 * @param amounts - Array of objects with userId and exact amount
 * @returns Record mapping user ID to their share in cents
 * @throws Error if sum of amounts does not equal total
 * 
 * @example
 * splitByAmounts(10000, [{id: "a", amount: 6000}, {id: "b", amount: 4000}])
 * // Returns { a: 6000, b: 4000 }
 */
export function splitByAmounts(
  totalCents: number,
  amounts: Array<{ id: string; amount: number }>
): Record<string, number> {
  const sumAmounts = amounts.reduce((sum, a) => sum + a.amount, 0);
  
  if (sumAmounts !== totalCents) {
    throw new Error(
      `Sum of amounts (${sumAmounts}) does not equal total (${totalCents})`
    );
  }

  const result: Record<string, number> = {};
  
  for (const { id, amount } of amounts) {
    result[id] = amount;
  }

  return result;
}
