'use client';

import { Avatar, type AvatarProps } from '@mui/material';
import { resolveAvatarUrl } from '@/app/_utils/avatarUrl';

export function isHttpUrl(str?: string | null): boolean {
  return str?.startsWith('http') ?? false;
}

interface SafeAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  src?: string | null;
  fallback?: string;
}

export function SafeAvatar({ src, fallback, ...props }: SafeAvatarProps) {
  const resolved = resolveAvatarUrl(src);

  if (resolved) {
    return (
      <Avatar src={resolved} {...props}>
        {fallback}
      </Avatar>
    );
  }

  return <Avatar {...props}>{fallback}</Avatar>;
}
