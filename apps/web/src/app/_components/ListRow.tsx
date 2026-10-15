'use client';

import type { ReactNode } from 'react';
import { Card, CardActionArea, Stack, Typography } from '@mui/material';
import { radius } from '../_theme/tokens';

export type PpListRow = {
  leading?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
};

/**
 * WhatsApp-style list row: leading visual, bold title, secondary line, trailing
 * slot (e.g. a timestamp). The whole row is tappable.
 */
export function ListRow({ leading, title, subtitle, trailing, onClick }: PpListRow) {
  return (
    <Card elevation={0} sx={{ borderRadius: `${radius.md}px`, overflow: 'hidden' }}>
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {leading}
          <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Stack>
          {trailing}
        </Stack>
      </CardActionArea>
    </Card>
  );
}
