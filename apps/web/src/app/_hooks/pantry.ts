'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/_utils/apiClient';
import type { PantryItem, PantrySuggestion } from '@family-recipe/shared';

export function usePantryQuery() {
  return useQuery({
    queryKey: ['pantry'],
    queryFn: async () => {
      const res = await apiClient.get<{ items: PantryItem[] }>('/v1/pantry');
      return res.data.items ?? [];
    },
  });
}

export function useAddPantryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await apiClient.post<PantryItem>('/v1/pantry', { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
}

export function useRemovePantryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/pantry/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
}

export function usePantrySuggestionsQuery() {
  return useQuery({
    queryKey: ['pantry', 'suggest'],
    queryFn: async () => {
      const res = await apiClient.get<{ suggestions: PantrySuggestion[] }>('/v1/pantry/suggest');
      return res.data.suggestions ?? [];
    },
  });
}
