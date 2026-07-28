'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../_components/BottomNavigation';
import { PpWC } from '../_types/types';
import { Box } from '@mui/material';
import { useAuth } from '../_providers/AuthContext';

export default function RootLayout({ children }: PpWC) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Don't render children until auth check is complete
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1, paddingBottom: '64px' }}>{children}</main>
      <BottomNavigation />
    </Box>
  );
}
