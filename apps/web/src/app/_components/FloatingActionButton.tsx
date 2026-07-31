'use client';

import { Fab, Tooltip } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

type PpFloatingActionButton = {
  icon: ReactNode;
  href: string;
  label: string;
};

export function FloatingActionButton({ icon, href, label }: PpFloatingActionButton) {
  return (
    <Tooltip title={label}>
      <Fab
        component={Link}
        href={href}
        color="primary"
        aria-label={label}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          zIndex: 1000,
        }}
      >
        {icon}
      </Fab>
    </Tooltip>
  );
}
