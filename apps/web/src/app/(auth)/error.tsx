'use client';

import React, { useEffect } from 'react';
import { GenericErrorScreen } from '@/app/_components/GenericErrorScreen';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Error in auth section:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return <GenericErrorScreen error={error} reset={reset} isDevelopment={isDevelopment} />;
}
