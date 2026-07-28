'use client';

import { useQuery } from '@tanstack/react-query';
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
