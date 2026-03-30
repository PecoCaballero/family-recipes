'use client';

import { Container, Stack } from '@mui/material';
import { PpWC } from '../_types/types';

export function SceneContent({ children }: PpWC): React.ReactElement {
  return <Stack sx={{ maxWidth: '1200px', marginTop: 7 }}>{children}</Stack>;
}

export function Scene({ children }: PpWC): React.ReactElement {
  return <Container sx={{ minHeight: "100vh", padding: 0 }}>{children}</Container>;
}

export function CenteredFullPage({ children }: PpWC): React.ReactElement {
  return (
    <Stack
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      {children}
    </Stack>
  );
}
