import { useState, useCallback } from 'react';
import {
  splitEvenly,
  splitByPercentages,
  splitByShares,
  splitByAmounts,
  toCents,
} from '@pinxesplit/shared';

export type SplitType = 'equal' | 'amount' | 'percentage' | 'shares';

export interface SplitParticipant {
  userId: string;
  name: string;
  included: boolean;
  amount?: number; // For amount split (in minor units/cents)
  percentage?: number; // For percentage split (0-100)
  shares?: number; // For shares split (positive integer)
}

export interface Split {
  userId: string;
  paidShare: number; // Amount user paid (in minor units)
  owedShare: number; // Amount user owes (in minor units)
  percentage?: number; // For percentage-based splits
}

export interface SplitCalculatorState {
  splitType: SplitType;
  participants: SplitParticipant[];
  payerId: string;
  totalAmount: number; // In minor units (cents)
  currency: string;
  scale: number; // Currency scale (100 for most currencies)
}

export interface SplitCalculatorResult {
  state: SplitCalculatorState;
  setSplitType: (type: SplitType) => void;
  setPayerId: (userId: string) => void;
  setTotalAmount: (amount: number) => void;
  toggleParticipant: (userId: string) => void;
  updateParticipantAmount: (userId: string, amount: number) => void;
  updateParticipantPercentage: (userId: string, percentage: number) => void;
  updateParticipantShares: (userId: string, shares: number) => void;
  calculateSplits: () => Split[];
  isValid: () => boolean;
  validationError: string | null;
  reset: (members: Array<{ userId: string; name: string }>, payerId: string) => void;
}

/**
 * Hook for managing split calculator state and validation
 */
export function useSplitCalculator(
  initialMembers: Array<{ userId: string; name: string }>,
  initialPayerId: string,
  initialAmount: number = 0,
  currency: string = 'USD',
  scale: number = 100
): SplitCalculatorResult {
  const [state, setState] = useState<SplitCalculatorState>({
    splitType: 'equal',
    participants: initialMembers.map((member) => ({
      userId: member.userId,
      name: member.name,
      included: true,
      amount: 0,
      percentage: 0,
      shares: 1,
    })),
    payerId: initialPayerId,
    totalAmount: initialAmount,
    currency,
    scale,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const setSplitType = useCallback((type: SplitType) => {
    setState((prev) => ({
      ...prev,
      splitType: type,
    }));
    setValidationError(null);
  }, []);

  const setPayerId = useCallback((userId: string) => {
    setState((prev) => ({
      ...prev,
      payerId: userId,
    }));
  }, []);

  const setTotalAmount = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      totalAmount: amount,
    }));
  }, []);

  const toggleParticipant = useCallback((userId: string) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.userId === userId ? { ...p, included: !p.included } : p
      ),
    }));
  }, []);

  const updateParticipantAmount = useCallback((userId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.userId === userId ? { ...p, amount } : p
      ),
    }));
  }, []);

  const updateParticipantPercentage = useCallback((userId: string, percentage: number) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.userId === userId ? { ...p, percentage } : p
      ),
    }));
  }, []);

  const updateParticipantShares = useCallback((userId: string, shares: number) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.userId === userId ? { ...p, shares } : p
      ),
    }));
  }, []);

  const reset = useCallback(
    (members: Array<{ userId: string; name: string }>, payerId: string) => {
      setState({
        splitType: 'equal',
        participants: members.map((member) => ({
          userId: member.userId,
          name: member.name,
          included: true,
          amount: 0,
          percentage: 0,
          shares: 1,
        })),
        payerId,
        totalAmount: state.totalAmount,
        currency: state.currency,
        scale: state.scale,
      });
      setValidationError(null);
    },
    [state.totalAmount, state.currency, state.scale]
  );

  const calculateSplits = useCallback((): Split[] => {
    const { splitType, participants, payerId, totalAmount } = state;
    const includedParticipants = participants.filter((p) => p.included);

    if (includedParticipants.length === 0 || totalAmount === 0) {
      return [];
    }

    try {
      let owedShares: Record<string, number> = {};

      switch (splitType) {
        case 'equal':
          owedShares = splitEvenly(
            totalAmount,
            includedParticipants.map((p) => p.userId),
            payerId
          );
          break;

        case 'percentage': {
          const percentages = includedParticipants.map((p) => ({
            id: p.userId,
            percentage: p.percentage || 0,
          }));
          owedShares = splitByPercentages(totalAmount, percentages, payerId);
          break;
        }

        case 'shares': {
          const shares = includedParticipants.map((p) => ({
            id: p.userId,
            shares: p.shares || 1,
          }));
          owedShares = splitByShares(totalAmount, shares, payerId);
          break;
        }

        case 'amount': {
          const amounts = includedParticipants.map((p) => ({
            id: p.userId,
            amount: p.amount || 0,
          }));
          owedShares = splitByAmounts(totalAmount, amounts);
          break;
        }
      }

      // Convert to Split format with paidShare and owedShare
      return Object.entries(owedShares).map(([userId, owedShare]) => ({
        userId,
        paidShare: userId === payerId ? totalAmount : 0,
        owedShare,
        ...(splitType === 'percentage' && {
          percentage: participants.find((p) => p.userId === userId)?.percentage,
        }),
      }));
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid split configuration');
      return [];
    }
  }, [state]);

  const isValid = useCallback((): boolean => {
    const { splitType, participants, totalAmount } = state;
    const includedParticipants = participants.filter((p) => p.included);

    if (includedParticipants.length === 0) {
      setValidationError('At least one participant must be included');
      return false;
    }

    if (totalAmount <= 0) {
      setValidationError('Amount must be greater than zero');
      return false;
    }

    try {
      switch (splitType) {
        case 'percentage': {
          const totalPercentage = includedParticipants.reduce(
            (sum, p) => sum + (p.percentage || 0),
            0
          );
          if (Math.abs(totalPercentage - 100) > 0.01) {
            setValidationError(`Percentages must sum to 100% (current: ${totalPercentage.toFixed(1)}%)`);
            return false;
          }
          break;
        }

        case 'amount': {
          const totalSplit = includedParticipants.reduce(
            (sum, p) => sum + (p.amount || 0),
            0
          );
          if (totalSplit !== totalAmount) {
            setValidationError(
              `Split amounts must equal total (${totalSplit} ≠ ${totalAmount})`
            );
            return false;
          }
          break;
        }

        case 'shares': {
          const hasInvalidShares = includedParticipants.some(
            (p) => !p.shares || p.shares <= 0
          );
          if (hasInvalidShares) {
            setValidationError('All shares must be positive numbers');
            return false;
          }
          break;
        }
      }

      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Validation error');
      return false;
    }
  }, [state]);

  return {
    state,
    setSplitType,
    setPayerId,
    setTotalAmount,
    toggleParticipant,
    updateParticipantAmount,
    updateParticipantPercentage,
    updateParticipantShares,
    calculateSplits,
    isValid,
    validationError,
    reset,
  };
}
