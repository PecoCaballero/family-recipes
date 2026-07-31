'use client';

import { Button, CircularProgress, type ButtonProps } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  spinnerSize?: number;
}

export function LoadingButton({
  loading,
  spinnerSize = 20,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={disabled || loading}>
      {loading ? <CircularProgress size={spinnerSize} /> : children}
    </Button>
  );
}
