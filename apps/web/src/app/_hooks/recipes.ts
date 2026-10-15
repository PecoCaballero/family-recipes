'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/_utils/apiClient';
import type { Recipe, RecipeDifficulty } from '@family-recipe/shared';

export function useRecipesQuery(search?: string, enabled = true) {
  return useQuery({
    queryKey: ['recipes', { search }],
    queryFn: async () => {
      const url = search ? `/v1/recipes?search=${encodeURIComponent(search)}` : '/v1/recipes';
      const res = await apiClient.get<{ recipes: Recipe[] }>(url);
      return res.data.recipes ?? [];
    },
    enabled,
  });
}

export function useRecipeQuery(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async () => {
      const res = await apiClient.get<{ recipe: Recipe }>(`/v1/recipes/${id}`);
      return res.data.recipe;
    },
    enabled: id.length > 0,
  });
}

type RecipeFormData = {
  name: string;
  description: string;
  image?: string;
  ingredients: { name: string; unit?: string; quantity: string }[];
  instructions: string;
  parentRecipeId?: string;
  cuisine?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: RecipeDifficulty;
};

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecipeFormData) => {
      await apiClient.post('/v1/recipes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecipeFormData) => {
      await apiClient.patch(`/v1/recipes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useDeleteRecipe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/v1/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useSaveRecipe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/v1/recipes/${id}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useUnsaveRecipe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/v1/recipes/${id}/unsave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
