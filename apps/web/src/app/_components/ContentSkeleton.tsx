'use client';

import { Skeleton, Stack, Card, CardContent } from '@mui/material';
import { radius } from '../_theme/tokens';

type ContentSkeletonProps = {
  variant?: 'card' | 'form' | 'list' | 'rows' | 'text';
  count?: number;
  height?: number;
};

function CardSkeleton() {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  );
}

function FormSkeleton() {
  return (
    <Stack spacing={2} sx={{ px: 2, py: 3, maxWidth: 500, mx: 'auto' }}>
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="rectangular" height={56} />
      <Skeleton variant="rectangular" height={56} />
      <Skeleton variant="rectangular" height={56} />
      <Skeleton variant="rectangular" height={48} />
    </Stack>
  );
}

function ListSkeleton() {
  return (
    <Stack spacing={1} sx={{ px: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={72}
          sx={{ borderRadius: `${radius.md}px` }}
        />
      ))}
    </Stack>
  );
}

function RowsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, i) => (
        <Stack
          key={i}
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ p: 1.5, borderRadius: `${radius.md}px`, bgcolor: 'background.paper' }}
        >
          <Skeleton variant="circular" width={48} height={48} />
          <Stack sx={{ flex: 1 }} spacing={0.5}>
            <Skeleton variant="text" width="55%" height={24} />
            <Skeleton variant="text" width="80%" height={18} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

function TextSkeleton({ height = 24 }: { height?: number }) {
  return (
    <Stack spacing={1}>
      <Skeleton variant="text" width="80%" height={height} />
      <Skeleton variant="text" width="60%" height={height} />
      <Skeleton variant="text" width="70%" height={height} />
    </Stack>
  );
}

export function ContentSkeleton({ variant = 'text', count = 1, height }: ContentSkeletonProps) {
  const items = Array.from({ length: count });

  switch (variant) {
    case 'card':
      return (
        <Stack>
          {items.map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </Stack>
      );
    case 'form':
      return <FormSkeleton />;
    case 'list':
      return <ListSkeleton />;
    case 'rows':
      return <RowsSkeleton count={count > 1 ? count : 6} />;
    case 'text':
      return <TextSkeleton height={height} />;
    default:
      return <TextSkeleton height={height} />;
  }
}
