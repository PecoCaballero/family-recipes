'use client';

import { Box, Stack } from '@mui/material';
import { PpWC } from '../_types/types';

export function SceneContent({ children }: PpWC): React.ReactElement {
  return <Stack sx={{ maxWidth: '1200px', marginTop: 7 }}>{children}</Stack>;
}

export function Scene({ children }: PpWC): React.ReactElement {
  return <Box>{children}</Box>;
}
