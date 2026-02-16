---
title: Debt Simplification Algorithm Research for PinxeSplit
description: Analysis of debt simplification algorithms comparing greedy, graph-based, and optimal approaches for a personal expense-splitting app with up to 20 users and multi-currency support
author: GitHub Copilot
ms.date: 2026-02-16
ms.topic: reference
keywords:
  - debt simplification
  - splitwise algorithm
  - minimum cash flow
  - expense splitting
  - optimal account balancing
---

## Problem Definition

Given N users within a group who have accumulated pairwise debts (from shared expenses), find the minimum set of settlement payments so that every user's net balance reaches zero.

Formally: let `balance[i]` be the net amount user `i` is owed (positive = creditor, negative = debtor). The sum of all balances is always zero. Find the minimum number of transfers `(from, to, amount)` such that after all transfers, every user's balance is zero.

This problem is equivalent to LeetCode 465, "Optimal Account Balancing," and appears in literature as the *minimum cash flow* or *debt settlement* problem.

## Approach Comparison

### Greedy Net-Balance Approach

Compute a net balance per user, then iteratively pair the largest creditor with the largest debtor.

**Algorithm:**

```text
1. For each user, compute net balance = (total owed to them) - (total they owe)
2. Remove users with zero balance
3. Sort or heap-ify remaining balances
4. While balances remain:
   a. Take max creditor (largest positive) and max debtor (largest negative)
   b. Transfer min(|creditor_balance|, |debtor_balance|) from debtor to creditor
   c. Update balances; remove any user reaching zero
```

**Complexity:** O(N log N) time with a priority queue, O(N) space.

**Pros:**

* Straightforward to implement
* Deterministic, predictable behavior
* Produces at most N-1 transactions (since each transfer zeroes out at least one user)

**Cons:**

* Not always optimal. Consider: balances `[+5, +3, -5, -3]`. Greedy might pair `+5` with `-5` and `+3` with `-3` (2 transactions, optimal). But with balances `[+7, +3, -5, -5]`, greedy pairs `+7` with `-5` yielding `+2`, then `+3` with `-5` yielding `-2`, then `+2` with `-2`, totaling 3 transactions. Optimal is also 3 here, but pathological cases can require more moves than the theoretical minimum.
* The guarantee is N-1 worst case; the true optimal can be as low as N minus the number of independent zero-sum subsets.

### Graph-Based (Cycle Elimination) Approach

Model debts as a directed weighted graph where an edge `(A → B, $x)` means A owes B $x. Detect and eliminate cycles to reduce edge count.

**Algorithm:**

```text
1. Build directed graph from all pairwise debts
2. Find cycles in the graph (DFS or similar)
3. For each cycle, subtract the minimum edge weight from all edges in the cycle
   (this eliminates at least one edge)
4. Remaining edges are the simplified debts
```

**Complexity:** Cycle detection is O(V+E), but repeated cycle elimination can be O(E^2) in the worst case.

**Pros:**

* Intuitive visual representation of debt flows
* Cycle elimination always reduces total number of payments
* Preserves the property that no new debtor-creditor relationships are introduced

**Cons:**

* More complex to implement
* Does not guarantee the global minimum transaction count
* Multiple cycles can interact, so the order of elimination affects the result
* After cycle elimination, you still need a final settlement step for acyclic remainders

### Optimal Approach (Bitmask DP)

The minimum number of transactions equals `K - C`, where `K` is the number of users with nonzero balance and `C` is the maximum number of groups these users can be partitioned into such that each group sums to zero.

Why? Within each zero-sum group of size `g`, you can settle in exactly `g - 1` transactions (a chain of payments). Maximizing the number of independent groups minimizes total transactions.

Finding the maximum zero-sum partition is equivalent to the *subset-sum partition* problem and is NP-hard in general, but for small N (up to ~20), bitmask dynamic programming solves it efficiently.

**Algorithm:**

```text
1. Compute net balance for each user; filter out zeros → array B of K nonzero values
2. Precompute subset sums for all 2^K subsets using bitmask
3. Find all subsets with sum = 0 (these are candidate zero-sum groups)
4. Use DP over bitmasks:
   dp[mask] = maximum number of zero-sum groups achievable using users in 'mask'
   For each mask, enumerate sub-masks that sum to zero:
     dp[mask] = max(dp[mask], dp[mask ^ sub] + 1)
5. Answer = K - dp[(1 << K) - 1]
6. Reconstruct actual groups by backtracking through DP
7. Within each group, settle using a chain (creditors pay debtors in sequence)
```

**Complexity:**

* Time: O(3^K) for sub-mask enumeration (each element is in the outer mask, the inner sub-mask, or neither). For K = 20, 3^20 ≈ 3.5 billion, which is tight. For K ≤ 15, it runs comfortably.
* Space: O(2^K) for the DP table and subset sums.
* K is the count of users with nonzero balance, typically much less than 20 in practice.

**Pros:**

* Provably optimal (minimizes transaction count)
* For K ≤ ~16, runs in under a second on modern hardware
* Clean separation between balance computation and settlement optimization

**Cons:**

* Exponential in the number of nonzero-balance users
* Implementation is more complex
* For K > 20, this approach becomes infeasible (though that exceeds PinxeSplit's constraint)

### What Splitwise Uses in Practice

Based on Splitwise's public blog and documented constraints, their "Simplify Debts" feature enforces three rules:

1. Everyone owes the same net amount before and after simplification
2. No new debtor-creditor relationships are introduced (no one owes someone they did not previously owe)
3. No individual's total outgoing payments increase

These constraints suggest Splitwise uses a *constrained greedy approach* rather than the global optimum. The third rule in particular prevents the optimal bitmask approach from being applied directly, because optimal reassignment of payment paths can route money through new intermediaries or increase an individual's gross outflow even while reducing total transaction count.

Within a group (where the "simplify debts" toggle is enabled), Splitwise likely uses the greedy net-balance algorithm, since all users already share a group relationship (rule 2 is satisfied). The global cross-group simplification ("debt shuffle") respects existing relationships more carefully, suggesting a cycle-elimination or constrained optimization approach.

## Recommended Algorithm for PinxeSplit

For PinxeSplit with a maximum of ~20 users per group, the **greedy net-balance approach** is recommended as the primary algorithm, with the **bitmask DP optimization available as a secondary mode** for power users.

**Rationale:**

* The greedy approach produces at most N-1 transactions, which is near-optimal in most real-world scenarios
* It runs in O(N log N) time, which is instant for N ≤ 20
* It is deterministic and easy to explain to users ("the person who is owed the most gets paid first")
* The bitmask DP approach can be offered as a "maximize simplification" option, since K (nonzero balances) is typically well under 16 in a group of 20

### Pseudocode: Greedy Net-Balance

```text
function simplifyDebts(expenses):
    balances = computeNetBalances(expenses)  // Map<UserId, number>
    
    // remove zero balances
    nonZero = balances.filter(b => b.value != 0)
    
    creditors = maxHeap(nonZero.filter(b => b.value > 0))  // sorted by amount desc
    debtors   = maxHeap(nonZero.filter(b => b.value < 0))  // sorted by |amount| desc
    
    transfers = []
    
    while creditors is not empty AND debtors is not empty:
        maxCreditor = creditors.pop()   // largest positive
        maxDebtor   = debtors.pop()     // largest negative (abs)
        
        amount = min(maxCreditor.amount, abs(maxDebtor.amount))
        transfers.push({ from: maxDebtor.id, to: maxCreditor.id, amount })
        
        remainingCredit = maxCreditor.amount - amount
        remainingDebt   = abs(maxDebtor.amount) - amount
        
        if remainingCredit > 0:
            creditors.push({ id: maxCreditor.id, amount: remainingCredit })
        if remainingDebt > 0:
            debtors.push({ id: maxDebtor.id, amount: remainingDebt })
    
    return transfers
```

### Pseudocode: Bitmask DP (Optimal)

```text
function optimalSimplify(expenses):
    balances = computeNetBalances(expenses)
    B = balances.filter(b => b != 0)   // array of K nonzero values
    K = B.length
    
    // Precompute subset sums
    subsetSum = array of 2^K zeros
    for mask = 1 to (2^K - 1):
        lowestBit = mask & (-mask)
        idx = log2(lowestBit)
        subsetSum[mask] = subsetSum[mask ^ lowestBit] + B[idx]
    
    // Mark zero-sum subsets
    isZeroSum = array of 2^K booleans
    for mask = 1 to (2^K - 1):
        isZeroSum[mask] = (subsetSum[mask] == 0)
    
    // DP: maximum number of zero-sum groups
    dp = array of 2^K zeros
    for mask = 1 to (2^K - 1):
        if not isZeroSum[mask]: continue
        dp[mask] = 1  // the mask itself is one group
        // enumerate proper sub-masks
        sub = (mask - 1) & mask
        while sub > 0:
            if isZeroSum[sub]:
                dp[mask] = max(dp[mask], dp[sub] + 1)
            sub = (sub - 1) & mask
    
    fullMask = (1 << K) - 1
    minTransactions = K - dp[fullMask]
    
    // Reconstruct groups via backtracking, then settle each group
    // with a chain of g-1 payments
    return reconstructAndSettle(dp, B, fullMask)
```

### Complexity Analysis

| Aspect      | Greedy               | Bitmask DP (Optimal)    |
|-------------|----------------------|-------------------------|
| Time        | O(N log N)           | O(3^K) where K ≤ N     |
| Space       | O(N)                 | O(2^K)                  |
| Optimality  | Near-optimal (≤ N-1) | Provably minimum        |
| Feasibility | Any N                | K ≤ ~20                 |

For K = 15 (a realistic upper bound for PinxeSplit), 3^15 = 14,348,907, which completes in milliseconds. For K = 20, 3^20 ≈ 3.5 billion, which may take a few seconds, an acceptable tradeoff for optimal results.

### Edge Cases

* **Zero balances:** Users with net zero are excluded from the settlement algorithm. They should still appear in the group but with no required transfers.
* **Single debtor/creditor:** Collapses to a single direct payment.
* **All balances cancel in pairs:** The greedy approach handles this optimally (matches perfect pairs). Bitmask DP also identifies these as independent two-person groups.
* **Floating-point rounding:** See the Rounding Strategy section. All arithmetic should use integer cents to avoid precision issues.
* **Single currency:** The algorithm runs identically; multi-currency adds no overhead since each currency is independent.

## Multi-Currency Handling

Run the simplification algorithm independently per currency. Each currency has its own balance sheet, and debts in different currencies are not fungible.

```text
function simplifyMultiCurrency(expenses):
    // Group expenses by currency
    byCurrency = groupBy(expenses, e => e.currency)
    
    allTransfers = []
    for each [currency, currencyExpenses] in byCurrency:
        transfers = simplifyDebts(currencyExpenses)
        allTransfers.push(...transfers.map(t => ({ ...t, currency })))
    
    return allTransfers
```

> [!IMPORTANT]
> Never convert between currencies for simplification. Users settle in the original currency of the expense. Cross-currency conversion is a separate UX concern (display only).

## Implementation Sketch (TypeScript)

```typescript
interface Transfer {
  from: string;       // userId of payer
  to: string;         // userId of payee
  amount: number;     // integer cents
  currency: string;
}

interface Expense {
  paidBy: string;
  currency: string;
  splits: { userId: string; amount: number }[]; // each user's share in cents
  totalAmount: number; // total in cents
}

/**
 * Compute net balance per user from a list of expenses.
 * Positive = owed money (creditor), Negative = owes money (debtor).
 */
function computeNetBalances(
  expenses: Expense[],
): Map<string, number> {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    // The payer is credited the full amount
    balances.set(
      expense.paidBy,
      (balances.get(expense.paidBy) ?? 0) + expense.totalAmount,
    );
    // Each split user is debited their share
    for (const split of expense.splits) {
      balances.set(
        split.userId,
        (balances.get(split.userId) ?? 0) - split.amount,
      );
    }
  }

  return balances;
}

/**
 * Simplify debts using the greedy net-balance algorithm.
 * Operates on a single currency. All amounts in integer cents.
 */
function simplifyDebts(expenses: Expense[], currency: string): Transfer[] {
  const balances = computeNetBalances(expenses);
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, balance] of balances) {
    if (balance > 0) creditors.push({ id, amount: balance });
    else if (balance < 0) debtors.push({ id, amount: -balance });
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    transfers.push({
      from: debtors[di].id,
      to: creditors[ci].id,
      amount,
      currency,
    });

    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;

    if (creditors[ci].amount === 0) ci++;
    if (debtors[di].amount === 0) di++;
  }

  return transfers;
}

/**
 * Simplify debts across multiple currencies.
 */
function simplifyMultiCurrency(expenses: Expense[]): Transfer[] {
  const byCurrency = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const group = byCurrency.get(expense.currency) ?? [];
    group.push(expense);
    byCurrency.set(expense.currency, group);
  }

  const allTransfers: Transfer[] = [];
  for (const [currency, currencyExpenses] of byCurrency) {
    allTransfers.push(...simplifyDebts(currencyExpenses, currency));
  }

  return allTransfers;
}
```

## Rounding Strategy

Splitting an expense among N people often produces fractional cents. For example, $10.00 split 3 ways yields $3.333... per person.

### Approach: Largest Remainder Method

1. Compute each user's exact share as `totalCents / N` (integer floor division)
2. Calculate the remainder: `totalCents - (floorShare * N)`
3. Assign the extra cents (one per user) to users in a deterministic order, starting with the expense creator

```typescript
function splitEvenly(
  totalCents: number,
  userIds: string[],
  creatorId: string,
): Map<string, number> {
  const n = userIds.length;
  const base = Math.floor(totalCents / n);
  let remainder = totalCents - base * n;

  const shares = new Map<string, number>();

  // Creator gets priority for extra cents, then remaining users in order
  const ordered = [
    creatorId,
    ...userIds.filter((id) => id !== creatorId),
  ];

  for (const id of ordered) {
    shares.set(id, base + (remainder > 0 ? 1 : 0));
    if (remainder > 0) remainder--;
  }

  return shares;
}
```

### Rules

* All internal arithmetic uses integer cents (or the smallest currency unit)
* The expense creator absorbs the remainder (consistent with Splitwise behavior)
* For unequal splits (percentage or share-based), round each share down, then distribute remainder cents starting from the creator
* The sum of all shares always equals the original total (invariant)
* Display amounts are formatted from cents at the UI layer

> [!NOTE]
> Some currencies have no fractional units (JPY, KRW). The system should store a `minorUnitScale` per currency (e.g., 100 for USD, 1 for JPY) and perform all arithmetic in the smallest unit.

## References

* LeetCode 465, "Optimal Account Balancing," the canonical formulation of minimum-transaction debt settlement
* The "Minimize Cash Flow" problem on GeeksforGeeks: greedy net-balance approach with heap-based implementation
* Splitwise blog, "Debts Made Simple" (2012): describes their simplification constraints (net preservation, no new relationships, no increased outflows)
* Stack Overflow discussion on minimum transactions: demonstrates greedy suboptimality and the connection to zero-sum subset partitioning
