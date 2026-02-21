import { describe, it, expect } from 'vitest';
import { simplifyDebts, simplifyMultiCurrency, type NetBalance } from './debt-simplification.js';

describe('simplifyDebts', () => {
  it('3 users single currency: A→B $10, B→C $10 simplified to A→C $10', () => {
    // A paid for B: A +10, B -10
    // B paid for C: B +10, C -10
    // Net: A +10, B 0, C -10
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 1000 },
      { userId: 'B', currency: 'USD', amount: 0 },
      { userId: 'C', currency: 'USD', amount: -1000 },
    ];
    const result = simplifyDebts(balances, 'USD');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ from: 'C', to: 'A', amount: 1000, currency: 'USD' });
  });

  it('4 users balanced pairs: [+5, +3, -5, -3] → 2 transfers', () => {
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 500 },
      { userId: 'B', currency: 'USD', amount: 300 },
      { userId: 'C', currency: 'USD', amount: -500 },
      { userId: 'D', currency: 'USD', amount: -300 },
    ];
    const result = simplifyDebts(balances, 'USD');
    expect(result).toHaveLength(2);

    // Verify net amounts preserved
    const received: Record<string, number> = {};
    const sent: Record<string, number> = {};
    for (const debt of result) {
      sent[debt.from] = (sent[debt.from] ?? 0) + debt.amount;
      received[debt.to] = (received[debt.to] ?? 0) + debt.amount;
    }
    expect(received['A']).toBe(500);
    expect(received['B']).toBe(300);
    expect(sent['C']).toBe(500);
    expect(sent['D']).toBe(300);
  });

  it('all-zero balances → 0 transfers', () => {
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 0 },
      { userId: 'B', currency: 'USD', amount: 0 },
    ];
    const result = simplifyDebts(balances, 'USD');
    expect(result).toHaveLength(0);
  });

  it('single debtor/creditor → 1 transfer', () => {
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 2000 },
      { userId: 'B', currency: 'USD', amount: -2000 },
    ];
    const result = simplifyDebts(balances, 'USD');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ from: 'B', to: 'A', amount: 2000, currency: 'USD' });
  });

  it('sum invariant: total debited = total credited per currency', () => {
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 3000 },
      { userId: 'B', currency: 'USD', amount: 1500 },
      { userId: 'C', currency: 'USD', amount: -2000 },
      { userId: 'D', currency: 'USD', amount: -2500 },
    ];
    const result = simplifyDebts(balances, 'USD');
    const totalSent = result.reduce((sum, d) => sum + d.amount, 0);
    const totalReceived = result.reduce((sum, d) => sum + d.amount, 0);
    expect(totalSent).toBe(totalReceived);
    expect(totalSent).toBe(4500);
  });

  it('produces at most N-1 transfers for N users with non-zero balance', () => {
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 1000 },
      { userId: 'B', currency: 'USD', amount: 2000 },
      { userId: 'C', currency: 'USD', amount: -1500 },
      { userId: 'D', currency: 'USD', amount: -1500 },
    ];
    const result = simplifyDebts(balances, 'USD');
    const nonZeroUsers = balances.filter((b) => b.amount !== 0).length;
    expect(result.length).toBeLessThanOrEqual(nonZeroUsers - 1);
  });
});

describe('simplifyMultiCurrency', () => {
  it('USD and EUR simplified independently', () => {
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 1000 },
      { userId: 'B', currency: 'USD', amount: -1000 },
      { userId: 'A', currency: 'EUR', amount: 500 },
      { userId: 'C', currency: 'EUR', amount: -500 },
    ];
    const result = simplifyMultiCurrency(balances);
    expect(result).toHaveLength(2);

    const usd = result.filter((d) => d.currency === 'USD');
    const eur = result.filter((d) => d.currency === 'EUR');

    expect(usd).toHaveLength(1);
    expect(usd[0]).toMatchObject({ from: 'B', to: 'A', amount: 1000, currency: 'USD' });

    expect(eur).toHaveLength(1);
    expect(eur[0]).toMatchObject({ from: 'C', to: 'A', amount: 500, currency: 'EUR' });
  });

  it('multi-currency debts never cross-converted', () => {
    const balances: NetBalance[] = [
      { userId: 'A', currency: 'USD', amount: 2000 },
      { userId: 'B', currency: 'USD', amount: -2000 },
      { userId: 'A', currency: 'JPY', amount: 500 },
      { userId: 'B', currency: 'JPY', amount: -500 },
    ];
    const result = simplifyMultiCurrency(balances);
    // No USD debt should have currency JPY and vice versa
    const usd = result.filter((d) => d.currency === 'USD');
    const jpy = result.filter((d) => d.currency === 'JPY');
    expect(usd.every((d) => d.currency === 'USD')).toBe(true);
    expect(jpy.every((d) => d.currency === 'JPY')).toBe(true);
  });

  it('empty balances → no debts', () => {
    expect(simplifyMultiCurrency([])).toHaveLength(0);
  });
});
