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
}

export function GenericErrorScreen({
  error,
  reset,
  isDevelopment = false,
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ color: 'white' }}>
          <Stack direction="row" spacing={1}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'white' }} />

            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {t('error.title', 'Something went wrong')}
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {t(
              'error.description',
              'We encountered an unexpected error. Please try again or contact support if the problem persists.',
            )}
          </Typography>

          {isDevelopment && error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
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
              <Button
                onClick={reset}
                variant="contained"
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                {t('error.retry', 'Try Again')}
              </Button>
            )}

            <Button
              onClick={() => router.push('/')}
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {t('error.home', 'Go Home')}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
