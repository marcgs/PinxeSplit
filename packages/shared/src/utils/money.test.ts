import { describe, it, expect } from 'vitest';
import {
  toCents,
  fromCents,
  splitEvenly,
  splitByPercentages,
  splitByShares,
  splitByAmounts,
} from './money';

describe('Money Utilities', () => {
  describe('toCents', () => {
    it('should convert dollars to cents', () => {
      expect(toCents(10.50, 100)).toBe(1050);
      expect(toCents(1, 100)).toBe(100);
      expect(toCents(0, 100)).toBe(0);
    });

    it('should handle different scales', () => {
      expect(toCents(100, 1)).toBe(100); // JPY
      expect(toCents(10.500, 1000)).toBe(10500); // BHD
    });

    it('should round properly', () => {
      expect(toCents(10.555, 100)).toBe(1056); // rounds up
      expect(toCents(10.554, 100)).toBe(1055); // rounds down
    });
  });

  describe('fromCents', () => {
    it('should convert cents to dollars', () => {
      expect(fromCents(1050, 100)).toBe(10.50);
      expect(fromCents(100, 100)).toBe(1);
      expect(fromCents(0, 100)).toBe(0);
    });

    it('should handle different scales', () => {
      expect(fromCents(100, 1)).toBe(100); // JPY
      expect(fromCents(10500, 1000)).toBe(10.5); // BHD
    });
  });

  describe('splitEvenly', () => {
    it('should split evenly with no remainder', () => {
      const result = splitEvenly(900, ['a', 'b', 'c'], 'a');
      expect(result).toEqual({ a: 300, b: 300, c: 300 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(900);
    });

    it('should give remainder to creator', () => {
      const result = splitEvenly(1000, ['a', 'b', 'c'], 'a');
      expect(result).toEqual({ a: 334, b: 333, c: 333 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(1000);
    });

    it('should handle single user', () => {
      const result = splitEvenly(1000, ['a'], 'a');
      expect(result).toEqual({ a: 1000 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(1000);
    });

    it('should handle two users', () => {
      const result = splitEvenly(1001, ['a', 'b'], 'a');
      expect(result).toEqual({ a: 501, b: 500 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(1001);
    });

    it('should handle zero amount', () => {
      const result = splitEvenly(0, ['a', 'b', 'c'], 'a');
      expect(result).toEqual({ a: 0, b: 0, c: 0 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(0);
    });

    it('should handle large amounts', () => {
      const result = splitEvenly(1000000, ['a', 'b', 'c'], 'a');
      expect(result.a + result.b + result.c).toBe(1000000);
    });

    it('should throw error for empty user list', () => {
      expect(() => splitEvenly(1000, [], 'a')).toThrow('Cannot split among zero users');
    });
  });

  describe('splitByPercentages', () => {
    it('should split by exact percentages', () => {
      const result = splitByPercentages(
        10000,
        [
          { id: 'a', pct: 50 },
          { id: 'b', pct: 30 },
          { id: 'c', pct: 20 },
        ],
        'a'
      );
      expect(result).toEqual({ a: 5000, b: 3000, c: 2000 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('should give remainder to creator', () => {
      const result = splitByPercentages(
        10001,
        [
          { id: 'a', pct: 50 },
          { id: 'b', pct: 50 },
        ],
        'a'
      );
      expect(result.a + result.b).toBe(10001);
      expect(result.a).toBeGreaterThanOrEqual(result.b);
    });

    it('should handle uneven percentages', () => {
      const result = splitByPercentages(
        10000,
        [
          { id: 'a', pct: 33.33 },
          { id: 'b', pct: 33.33 },
          { id: 'c', pct: 33.34 },
        ],
        'a'
      );
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('should throw error if percentages do not sum to 100', () => {
      expect(() =>
        splitByPercentages(
          10000,
          [
            { id: 'a', pct: 50 },
            { id: 'b', pct: 40 },
          ],
          'a'
        )
      ).toThrow('Percentages must sum to 100');
    });

    it('should handle zero amount', () => {
      const result = splitByPercentages(
        0,
        [
          { id: 'a', pct: 50 },
          { id: 'b', pct: 50 },
        ],
        'a'
      );
      expect(result).toEqual({ a: 0, b: 0 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(0);
    });

    it('should maintain sum invariant with remainder', () => {
      const result = splitByPercentages(
        999,
        [
          { id: 'a', pct: 33.33 },
          { id: 'b', pct: 33.33 },
          { id: 'c', pct: 33.34 },
        ],
        'a'
      );
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(999);
    });
  });

  describe('splitByShares', () => {
    it('should split by shares (2:1 ratio)', () => {
      const result = splitByShares(
        10000,
        [
          { id: 'a', shares: 2 },
          { id: 'b', shares: 1 },
        ],
        'a'
      );
      expect(result).toEqual({ a: 6667, b: 3333 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('should split by equal shares', () => {
      const result = splitByShares(
        9000,
        [
          { id: 'a', shares: 1 },
          { id: 'b', shares: 1 },
          { id: 'c', shares: 1 },
        ],
        'a'
      );
      expect(result).toEqual({ a: 3000, b: 3000, c: 3000 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(9000);
    });

    it('should give remainder to creator', () => {
      const result = splitByShares(
        10001,
        [
          { id: 'a', shares: 1 },
          { id: 'b', shares: 1 },
        ],
        'a'
      );
      expect(result.a + result.b).toBe(10001);
      expect(result.a).toBeGreaterThan(result.b);
    });

    it('should handle complex ratios (3:2:1)', () => {
      const result = splitByShares(
        12000,
        [
          { id: 'a', shares: 3 },
          { id: 'b', shares: 2 },
          { id: 'c', shares: 1 },
        ],
        'a'
      );
      expect(result).toEqual({ a: 6000, b: 4000, c: 2000 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(12000);
    });

    it('should throw error if total shares is zero', () => {
      expect(() =>
        splitByShares(
          10000,
          [
            { id: 'a', shares: 0 },
            { id: 'b', shares: 0 },
          ],
          'a'
        )
      ).toThrow('Total shares cannot be zero');
    });

    it('should handle zero amount', () => {
      const result = splitByShares(
        0,
        [
          { id: 'a', shares: 2 },
          { id: 'b', shares: 1 },
        ],
        'a'
      );
      expect(result).toEqual({ a: 0, b: 0 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(0);
    });

    it('should maintain sum invariant with remainder', () => {
      const result = splitByShares(
        9999,
        [
          { id: 'a', shares: 2 },
          { id: 'b', shares: 1 },
        ],
        'a'
      );
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(9999);
    });
  });

  describe('splitByAmounts', () => {
    it('should split by exact amounts', () => {
      const result = splitByAmounts(10000, [
        { id: 'a', amount: 6000 },
        { id: 'b', amount: 4000 },
      ]);
      expect(result).toEqual({ a: 6000, b: 4000 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('should handle zero amounts for some users', () => {
      const result = splitByAmounts(10000, [
        { id: 'a', amount: 10000 },
        { id: 'b', amount: 0 },
      ]);
      expect(result).toEqual({ a: 10000, b: 0 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('should throw error if sum does not match total', () => {
      expect(() =>
        splitByAmounts(10000, [
          { id: 'a', amount: 6000 },
          { id: 'b', amount: 3000 },
        ])
      ).toThrow('Sum of amounts (9000) does not equal total (10000)');
    });

    it('should throw error if sum exceeds total', () => {
      expect(() =>
        splitByAmounts(10000, [
          { id: 'a', amount: 6000 },
          { id: 'b', amount: 5000 },
        ])
      ).toThrow('Sum of amounts (11000) does not equal total (10000)');
    });

    it('should handle single user taking full amount', () => {
      const result = splitByAmounts(10000, [{ id: 'a', amount: 10000 }]);
      expect(result).toEqual({ a: 10000 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('should handle zero total', () => {
      const result = splitByAmounts(0, [
        { id: 'a', amount: 0 },
        { id: 'b', amount: 0 },
      ]);
      expect(result).toEqual({ a: 0, b: 0 });
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(0);
    });

    it('should maintain exact sum invariant', () => {
      const result = splitByAmounts(9999, [
        { id: 'a', amount: 5432 },
        { id: 'b', amount: 3210 },
        { id: 'c', amount: 1357 },
      ]);
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(9999);
    });
  });

  describe('Sum Invariant Tests', () => {
    it('splitEvenly maintains sum invariant with various totals', () => {
      const testCases = [1, 10, 100, 999, 1000, 1001, 10000, 99999];
      const userIds = ['a', 'b', 'c'];

      for (const total of testCases) {
        const result = splitEvenly(total, userIds, 'a');
        const sum = Object.values(result).reduce((a, b) => a + b, 0);
        expect(sum).toBe(total);
      }
    });

    it('splitByPercentages maintains sum invariant with various totals', () => {
      const testCases = [1, 10, 100, 999, 1000, 1001, 10000, 99999];
      const percentages = [
        { id: 'a', pct: 50 },
        { id: 'b', pct: 30 },
        { id: 'c', pct: 20 },
      ];

      for (const total of testCases) {
        const result = splitByPercentages(total, percentages, 'a');
        const sum = Object.values(result).reduce((a, b) => a + b, 0);
        expect(sum).toBe(total);
      }
    });

    it('splitByShares maintains sum invariant with various totals', () => {
      const testCases = [1, 10, 100, 999, 1000, 1001, 10000, 99999];
      const shares = [
        { id: 'a', shares: 2 },
        { id: 'b', shares: 1 },
      ];

      for (const total of testCases) {
        const result = splitByShares(total, shares, 'a');
        const sum = Object.values(result).reduce((a, b) => a + b, 0);
        expect(sum).toBe(total);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle large amounts without overflow', () => {
      const largeAmount = 999999999; // ~$10M in cents
      const result = splitEvenly(largeAmount, ['a', 'b'], 'a');
      expect(result.a + result.b).toBe(largeAmount);
    });

    it('should handle single cent splits', () => {
      const result = splitEvenly(1, ['a', 'b', 'c'], 'a');
      expect(result.a).toBe(1);
      expect(result.b).toBe(0);
      expect(result.c).toBe(0);
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(1);
    });

    it('should handle many users', () => {
      const userIds = Array.from({ length: 100 }, (_, i) => `user${i}`);
      const result = splitEvenly(10000, userIds, 'user0');
      const sum = Object.values(result).reduce((a, b) => a + b, 0);
      expect(sum).toBe(10000);
    });
  });
});
