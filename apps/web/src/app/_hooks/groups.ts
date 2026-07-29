'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/_utils/apiClient';
import type { Group, Recipe } from '@family-recipe/shared';

export function useGroupsQuery(search?: string) {
  return useQuery({
    queryKey: ['groups', { search }],
    queryFn: async () => {
      const url = search ? `/v1/groups?search=${encodeURIComponent(search)}` : '/v1/groups';
      const res = await apiClient.get<{ groups: Group[] }>(url);
      return res.data.groups ?? [];
    },
  });
}

export function useGroupQuery(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const res = await apiClient.get<{
        group: Group;
        recipes: Recipe[];
        isOwner: boolean;
      }>(`/v1/groups/${id}`);
      return res.data;
    },
    enabled: id.length > 0,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; icon?: string }) => {
      const res = await apiClient.post<Group>('/v1/groups', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; description?: string; icon?: string }) => {
      const res = await apiClient.patch<Group>(`/v1/groups/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useDeleteGroup(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/v1/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useAddRecipeToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, recipeId }: { groupId: string; recipeId: string }) => {
      const res = await apiClient.post(`/v1/groups/${groupId}/recipes`, { recipeId });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
}

export function useRemoveRecipeFromGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, recipeId }: { groupId: string; recipeId: string }) => {
      const res = await apiClient.post(`/v1/groups/${groupId}/remove-recipe`, { recipeId });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
}
