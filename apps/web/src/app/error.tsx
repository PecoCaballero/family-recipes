'use client';

import React, { useEffect } from 'react';
import { GenericErrorScreen } from '@/app/_components/GenericErrorScreen';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry, LogRocket)
    console.error('Error caught by boundary:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return <GenericErrorScreen error={error} reset={reset} isDevelopment={isDevelopment} />;
}
