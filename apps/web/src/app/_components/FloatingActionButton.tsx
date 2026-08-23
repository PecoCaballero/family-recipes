'use client';

import { Fab, Tooltip } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

type PpFloatingActionButton = {
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  label: string;
};

export function FloatingActionButton({ icon, href, onClick, label }: PpFloatingActionButton) {
  const sx = {
    position: 'fixed',
    bottom: 80,
    right: 24,
    zIndex: 1000,
  };

  return (
    <Tooltip title={label}>
      {href ? (
        <Fab component={Link} href={href} color="primary" aria-label={label} sx={sx}>
          {icon}
        </Fab>
      ) : (
        <Fab color="primary" aria-label={label} onClick={onClick} sx={sx}>
          {icon}
        </Fab>
      )}
    </Tooltip>
  );
}
