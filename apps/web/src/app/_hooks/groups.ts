'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/_utils/apiClient';
import type { Group, Recipe, MemberWithCount, PendingInvitation } from '@family-recipe/shared';

export function useGroupsQuery(search?: string) {
  return useQuery({
    queryKey: ['groups', { search }],
    queryFn: async () => {
      const url = search ? `/v1/groups?search=${encodeURIComponent(search)}` : '/v1/groups';
      const res = await apiClient.get<{ groups: Group[]; pendingInvitations: PendingInvitation[] }>(
        url,
      );
      return res.data;
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
        isAdmin: boolean;
        members: MemberWithCount[];
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

export function useQuitGroup(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ status: string; groupDeleted?: boolean }>(
        `/v1/groups/${groupId}/quit`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useRemoveMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.delete<{ status: string }>(
        `/v1/groups/${groupId}/members/${userId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

export function useAddMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.post<{ status: string }>(
        `/v1/groups/${groupId}/members/${userId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

export function useAddAdmin(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.post<{ status: string }>(
        `/v1/groups/${groupId}/admins`,
        { userId },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

export function useRemoveAdmin(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.delete<{ status: string }>(
        `/v1/groups/${groupId}/admins/${userId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

export function useBatchAddRecipes(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeIds: string[]) => {
      const res = await apiClient.post<{ added: string[]; skipped: string[] }>(
        `/v1/groups/${groupId}/recipes/batch`,
        { recipeIds },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

export function useCreateInvitation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteeUserId: string) => {
      const res = await apiClient.post(`/v1/groups/${groupId}/invitations`, { inviteeUserId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useAcceptInvitation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await apiClient.post<{ status: string }>(
        `/v1/groups/${groupId}/invitations/${invitationId}/accept`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export function useSearchUsers(email: string) {
  return useQuery({
    queryKey: ['users', 'search', { email }],
    queryFn: async () => {
      const res = await apiClient.get<{ users: UserSearchResult[] }>(
        `/v1/users/search?email=${encodeURIComponent(email)}`,
      );
      return res.data.users ?? [];
    },
    enabled: email.length > 0,
  });
}
