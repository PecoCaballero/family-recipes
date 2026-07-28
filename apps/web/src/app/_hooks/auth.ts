'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/app/_utils/apiClient';
import type { AuthResponse } from '@family-recipe/shared';

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await apiClient.post<AuthResponse>('/v1/auth/login', input);
      return res.data;
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (input: { name: string; email: string; password: string }) => {
      const res = await apiClient.post<AuthResponse>('/v1/auth/register', input);
      return res.data;
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async (input: { refreshToken: string }) => {
      await apiClient.post('/v1/auth/logout', input);
    },
  });
}
