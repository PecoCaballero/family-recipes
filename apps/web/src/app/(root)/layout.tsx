'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../_components/BottomNavigation';
import { PpWC } from '../_types/types';
import { Box } from '@mui/material';
import { useAuth } from '../_providers/AuthContext';
import { LoadingPage } from '../_scenes/LoadingPage';

export default function RootLayout({ children }: PpWC) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <LoadingPage />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1, paddingBottom: '64px' }}>{children}</main>
      <BottomNavigation />
    </Box>
  );
}
