'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/app/_utils/apiClient';
import type { UpdateProfileInput, ChangePasswordInput } from '@family-recipe/shared';

export function useUserSettingsUpdate() {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean | string }) => {
      await apiClient.patch('/v1/users/me/settings', { [key]: value });
    },
  });
}

export function useProfileUpdate() {
  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const res = await apiClient.patch('/v1/users/me', data);
      return res.data;
    },
  });
}

export function usePasswordChange() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      await apiClient.post('/v1/users/me/password', data);
    },
  });
}

export function useAvatarUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiClient.post('/v1/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data as { avatarUrl: string };
    },
  });
}

export function useAvatarRemove() {
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/v1/users/me/avatar');
    },
  });
}

export function useAccountDeletion() {
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/v1/users/me');
    },
  });
}
