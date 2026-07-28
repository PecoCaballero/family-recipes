'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/app/_utils/apiClient';

export function useUserSettingsUpdate() {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean | string }) => {
      await apiClient.patch('/v1/users/me/settings', { [key]: value });
    },
  });
}
