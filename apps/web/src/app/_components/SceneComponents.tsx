'use client';

import { Container, Stack } from '@mui/material';
import { PpWC } from '../_types/types';

export function SceneContent({ children }: PpWC): React.ReactElement {
  return <Stack sx={{ maxWidth: '1200px' }}>{children}</Stack>;
}

export function Scene({ children }: PpWC): React.ReactElement {
  return (
    <Container sx={{ minHeight: '100vh', padding: 0, display: 'flex', flexDirection: 'column' }}>
      {children}
    </Container>
  );
}

export type PpCenteredFullPage = PpWC & {
  sx?: React.CSSProperties;
};

export function CenteredFullPage({ children, sx }: PpCenteredFullPage): React.ReactElement {
  return (
    <Stack
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: 4,
        gap: 2,
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}
