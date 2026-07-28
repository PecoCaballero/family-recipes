'use client';

import React from 'react';
import { GenericErrorScreen } from '@/app/_components/GenericErrorScreen';

export default function NotFound() {
  return (
    <GenericErrorScreen
      error={
        {
          message: 'Page not found',
        } as Error
      }
      isDevelopment={false}
    />
  );
}
