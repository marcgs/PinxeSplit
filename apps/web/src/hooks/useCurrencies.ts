import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  scale: number;
  createdAt: string;
}

/**
 * Hook to fetch all currencies from the API
 */
export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async (): Promise<Currency[]> => {
      const response = await apiClient('/api/v1/currencies');
      return response as Currency[];
    },
  });
}
