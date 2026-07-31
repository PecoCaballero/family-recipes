'use client';

import { Avatar, type AvatarProps } from '@mui/material';

export function isHttpUrl(str?: string | null): boolean {
  return str?.startsWith('http') ?? false;
}

interface SafeAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  src?: string | null;
  fallback?: string;
}

export function SafeAvatar({ src, fallback, ...props }: SafeAvatarProps) {
  if (isHttpUrl(src)) {
    return (
      <Avatar src={src!} {...props}>
        {fallback}
      </Avatar>
    );
  }

  return <Avatar {...props}>{src || fallback}</Avatar>;
}
