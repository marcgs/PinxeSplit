/**
 * Debt simplification using the greedy net-balance algorithm.
 *
 * Multi-currency balances are tracked independently and never cross-converted.
 */

export interface NetBalance {
  userId: string;
  currency: string;
  amount: number; // positive = owed to this user, negative = this user owes
}

export interface Debt {
  from: string; // userId of the debtor
  to: string; // userId of the creditor
  amount: number; // positive integer (minor units)
  currency: string;
}

/**
 * Simplify debts for a single currency using the greedy net-balance algorithm.
 *
 * Algorithm:
 *  1. Separate into creditors (amount > 0) and debtors (amount < 0).
 *  2. Sort both lists by absolute amount descending.
 *  3. Greedily match the largest creditor with the largest debtor until settled.
 *
 * At most N-1 transfers are produced for N users with non-zero balance.
 */
export function simplifyDebts(balances: NetBalance[], currency: string): Debt[] {
  const filtered = balances.filter((b) => b.currency === currency && b.amount !== 0);

  // creditors: amount > 0 (people who are owed money)
  const creditors = filtered
    .filter((b) => b.amount > 0)
    .map((b) => ({ userId: b.userId, amount: b.amount }));

  // debtors: amount < 0 (people who owe money)
  const debtors = filtered
    .filter((b) => b.amount < 0)
    .map((b) => ({ userId: b.userId, amount: -b.amount })); // store as positive

  const result: Debt[] = [];

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const transfer = Math.min(creditor.amount, debtor.amount);

    result.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: transfer,
      currency,
    });

    creditor.amount -= transfer;
    debtor.amount -= transfer;

    if (creditor.amount === 0) ci++;
    if (debtor.amount === 0) di++;
  }

  return result;
}

/**
 * Simplify debts across multiple currencies independently.
 * Each currency is simplified in isolation — no cross-currency conversion.
 */
export function simplifyMultiCurrency(balances: NetBalance[]): Debt[] {
  const currencies = [...new Set(balances.map((b) => b.currency))];
  return currencies.flatMap((currency) => simplifyDebts(balances, currency));
}
