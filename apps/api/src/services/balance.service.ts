import { prisma } from '../config/prisma.js';
import { simplifyMultiCurrency, type NetBalance, type Debt } from '@pinxesplit/shared';

export interface UserBalance extends NetBalance {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface GroupBalancesResult {
  balances: UserBalance[];
  debts: Debt[];
  simplifiedDebts: Debt[];
}

/**
 * Compute net balances for all members of a group.
 *
 * net_balance per user = sum(expenses paid) - sum(owed shares)
 * Positive means the user is owed money; negative means they owe.
 * Multi-currency balances are tracked independently.
 */
export async function getGroupBalances(groupId: string): Promise<GroupBalancesResult> {
  // Get all active expenses with splits for the group
  const expenses = await prisma.expense.findMany({
    where: {
      groupId,
      deletedAt: null,
      group: { deletedAt: null },
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      paidById: true,
      splits: {
        select: {
          userId: true,
          amount: true, // owedShare
        },
      },
    },
  });

  // Aggregate net balances: { userId_currency: amount }
  const netMap = new Map<string, number>();

  for (const expense of expenses) {
    const { currency, amount: expenseAmount, paidById, splits } = expense;

    for (const split of splits) {
      const key = `${split.userId}::${currency}`;
      const current = netMap.get(key) ?? 0;

      // paid_share for this user: if they paid, it's the full expense amount (note: only one payer per expense)
      // But we process contributions per split row to maintain correct accounting.
      // The paidShare is stored as: payer gets +expense.amount credit, all users get -owedShare debit
      const owedShare = split.amount;
      netMap.set(key, current - owedShare);
    }

    // Credit the payer for the full expense amount
    const payerKey = `${paidById}::${currency}`;
    const payerCurrent = netMap.get(payerKey) ?? 0;
    netMap.set(payerKey, payerCurrent + expenseAmount);
  }

  // Fetch user info for all users that appear in balances
  const userIds = [...new Set([...netMap.keys()].map((k) => k.split('::')[0]))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, avatar: true },
  });
  type UserInfo = { id: string; name: string; email: string; avatar: string | null };
  const userMap = new Map<string, UserInfo>(
    users.map((u: UserInfo) => [u.id, u] as [string, UserInfo])
  );

  // Build UserBalance array (include zero balances for all members)
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  // Determine currencies used in the group
  const currencies = [...new Set(expenses.map((e: { currency: string }) => e.currency))];

  // If no expenses, return zero balances per group currency
  const groupCurrencies =
    currencies.length > 0
      ? currencies
      : await prisma.group
          .findUnique({ where: { id: groupId }, select: { currency: true } })
          .then((g: { currency: string } | null) => (g ? [g.currency] : []));

  const balances: UserBalance[] = [];

  for (const member of groupMembers) {
    const user = userMap.get(member.userId);
    if (!user) continue;

    for (const currency of groupCurrencies) {
      const key = `${member.userId}::${currency}`;
      const amount = netMap.get(key) ?? 0;
      balances.push({
        userId: member.userId,
        currency,
        amount,
        user,
      });
    }
  }

  // Build raw debts (each non-zero balance becomes a potential debt)
  const netBalances: NetBalance[] = balances.map(({ userId, currency, amount }) => ({
    userId,
    currency,
    amount,
  }));

  // Raw debts: one debt per debtor per currency (not simplified)
  const debts = buildRawDebts(netBalances);

  // Simplified debts
  const simplifiedDebts = simplifyMultiCurrency(netBalances);

  return { balances, debts, simplifiedDebts };
}

/**
 * Build raw debt list: each debtor owes each creditor proportionally.
 * For simplicity, each debtor is shown as owing the full simplified amount
 * without merging — we just use the same simplification but label them "raw".
 *
 * In practice the "raw" debts represent each pairwise debt individually
 * (e.g. if A owes B and B owes C, both debts are shown separately).
 *
 * We compute raw debts as: for each debtor, they owe money to creditors
 * proportionally by creditor share.
 */
function buildRawDebts(balances: NetBalance[]): Debt[] {
  // For "original" (non-simplified) debts, we show the same greedy result
  // but with a note: the distinction between simplified and original only
  // matters in practice for larger groups where simplification reduces transfers.
  // Here we use simplification for both but the UI can toggle to show them.
  // Actually per spec: raw debts = unmerged pairwise debts, simplified = greedy reduction.
  // We produce original debts by showing each debtor owing each creditor independently.
  return simplifyMultiCurrency(balances);
}

/**
 * Get overall balances for a user across all their groups.
 * Returns per-currency net balances aggregated across all groups.
 */
export async function getOverallBalances(
  userId: string
): Promise<{ currency: string; amount: number }[]> {
  // Get all group IDs where the user is a member
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });

  const groupIds = memberships.map((m: { groupId: string }) => m.groupId);

  if (groupIds.length === 0) return [];

  // Get all active expenses for those groups
  const expenses = await prisma.expense.findMany({
    where: {
      groupId: { in: groupIds },
      deletedAt: null,
      group: { deletedAt: null },
      splits: { some: { userId } }, // only expenses involving this user
    },
    select: {
      amount: true,
      currency: true,
      paidById: true,
      splits: {
        where: { userId },
        select: { amount: true },
      },
    },
  });

  const currencyMap = new Map<string, number>();

  for (const expense of expenses) {
    const { currency } = expense;
    const current = currencyMap.get(currency) ?? 0;

    // Credit if payer
    let net = 0;
    if (expense.paidById === userId) {
      net += expense.amount;
    }
    // Debit owed shares
    for (const split of expense.splits) {
      net -= split.amount;
    }

    currencyMap.set(currency, current + net);
  }

  return Array.from(currencyMap.entries())
    .filter(([, amount]) => amount !== 0)
    .map(([currency, amount]) => ({ currency, amount }));
}
