import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { groupKeys } from './useGroups';

// Types for expense data
export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // Amount in minor units (cents)
  percentage: number | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
  };
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // Amount in minor units (cents)
  currency: string;
  paidById: string;
  categoryId: string | null;
  date: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  splits: ExpenseSplit[];
  paidBy: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  group?: {
    id: string;
    name: string;
    currency: string;
  };
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  currency?: string;
  paidById: string;
  categoryId?: string;
  date?: string;
  splits: Array<{
    userId: string;
    paidShare: number;
    owedShare: number;
    percentage?: number;
  }>;
}

export interface UpdateExpenseData {
  description?: string;
  amount?: number;
  currency?: string;
  paidById?: string;
  categoryId?: string;
  date?: string;
  splits?: Array<{
    userId: string;
    paidShare: number;
    owedShare: number;
    percentage?: number;
  }>;
}

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (groupId: string, page?: number, limit?: number) => 
    [...expenseKeys.lists(), groupId, { page, limit }] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

/**
 * Hook to fetch expenses for a group (paginated)
 */
export function useGroupExpenses(
  groupId: string | undefined,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: expenseKeys.list(groupId || '', page, limit),
    queryFn: async () => {
      const data = await apiClient<ExpensesResponse>(
        `/api/v1/groups/${groupId}/expenses?page=${page}&limit=${limit}`
      );
      return data;
    },
    enabled: !!groupId,
  });
}

/**
 * Hook to fetch a specific expense by ID
 */
export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: expenseKeys.detail(id || ''),
    queryFn: async () => {
      const data = await apiClient<Expense>(`/api/v1/expenses/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new expense
 */
export function useCreateExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      const expense = await apiClient<Expense>(
        `/api/v1/groups/${groupId}/expenses`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return expense;
    },
    onSuccess: (_newExpense) => {
      // Invalidate expense lists for this group
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidate group detail to update expense count
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
}

/**
 * Hook to update an expense
 */
export function useUpdateExpense(expenseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateExpenseData) => {
      const expense = await apiClient<Expense>(
        `/api/v1/expenses/${expenseId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      );
      return expense;
    },
    onSuccess: (updatedExpense) => {
      // Update the expense detail cache
      queryClient.setQueryData(
        expenseKeys.detail(expenseId),
        updatedExpense
      );
      // Invalidate expense lists
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidate group detail
      if (updatedExpense.groupId) {
        queryClient.invalidateQueries({ 
          queryKey: groupKeys.detail(updatedExpense.groupId) 
        });
      }
    },
  });
}

/**
 * Hook to delete an expense (soft delete)
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      await apiClient(`/api/v1/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      return expenseId;
    },
    onSuccess: (_deletedId, expenseId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: expenseKeys.detail(expenseId) });
      // Invalidate all expense lists
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidate all group details (to update counts)
      queryClient.invalidateQueries({ queryKey: groupKeys.details() });
    },
  });
}
