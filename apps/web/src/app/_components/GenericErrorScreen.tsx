'use client';

import React from 'react';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface GenericErrorScreenProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  isDevelopment?: boolean;
  title?: string;
  description?: string;
}

export function GenericErrorScreen({
  error,
  reset,
  isDevelopment = false,
  title,
  description,
}: GenericErrorScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ color: 'text.primary' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />

            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {title ?? t('error.title')}
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {description ?? t('error.description')}
          </Typography>

          {isDevelopment && error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                textAlign: 'left',
              }}
            >
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                <strong>Error:</strong> {error.message}
              </Typography>
              {error.digest && (
                <Typography
                  variant="caption"
                  sx={{ fontFamily: 'monospace', display: 'block', mt: 1 }}
                >
                  <strong>Digest:</strong> {error.digest}
                </Typography>
              )}
            </Box>
          )}

          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            {reset && (
              <Button onClick={reset} variant="contained">
                {t('error.retry')}
              </Button>
            )}

            <Button onClick={() => router.push('/')} variant="outlined">
              {t('error.home')}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
