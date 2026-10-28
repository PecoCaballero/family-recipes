'use client';

import { Fab, Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

type PpFloatingActionButton = {
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  label: string;
  sx?: SxProps<Theme>;
};

export function FloatingActionButton({
  icon,
  href,
  onClick,
  label,
  sx: sxOverride,
}: PpFloatingActionButton) {
  const sx: SxProps<Theme> = {
    position: 'fixed',
    bottom: 80,
    right: 24,
    zIndex: 1000,
    ...sxOverride,
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
