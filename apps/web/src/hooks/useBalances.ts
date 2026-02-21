import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { expenseKeys } from './useExpenses';
import { groupKeys } from './useGroups';

export interface UserBalance {
  userId: string;
  currency: string;
  amount: number; // positive = owed to user, negative = user owes
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface Debt {
  from: string; // userId of debtor
  to: string; // userId of creditor
  amount: number; // positive minor units
  currency: string;
}

export interface GroupBalancesResponse {
  balances: UserBalance[];
  debts: Debt[];
  simplifiedDebts: Debt[];
}

export interface OverallBalance {
  currency: string;
  amount: number;
}

export interface OverallBalancesResponse {
  balances: OverallBalance[];
}

export interface SettleUpData {
  toUserId: string;
  amount: number;
  currencyCode?: string;
}

// Query keys
export const balanceKeys = {
  all: ['balances'] as const,
  group: (groupId: string) => [...balanceKeys.all, 'group', groupId] as const,
  overall: () => [...balanceKeys.all, 'overall'] as const,
};

/**
 * Hook to fetch balances for a group
 */
export function useGroupBalances(groupId: string | undefined) {
  return useQuery({
    queryKey: balanceKeys.group(groupId || ''),
    queryFn: async () => {
      const data = await apiClient<GroupBalancesResponse>(
        `/api/v1/groups/${groupId}/balances`
      );
      return data;
    },
    enabled: !!groupId,
  });
}

/**
 * Hook to fetch overall balances for the authenticated user
 */
export function useOverallBalances() {
  return useQuery({
    queryKey: balanceKeys.overall(),
    queryFn: async () => {
      const data = await apiClient<OverallBalancesResponse>('/api/v1/balances');
      return data;
    },
  });
}

/**
 * Hook to settle up within a group
 */
export function useSettleUp(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SettleUpData) => {
      return await apiClient(`/api/v1/groups/${groupId}/settle`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate group balances and overall balances
      queryClient.invalidateQueries({ queryKey: balanceKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: balanceKeys.overall() });
      // Invalidate expense lists so the payment shows up
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidate group detail
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
}
