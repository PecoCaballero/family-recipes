'use client';

import React, { useEffect, useState } from 'react';
import { SceneContent } from '@/app/_components/SceneComponents';
import { routes } from '@/app/_utils/routes';
import { fetchHealth } from '@/app/_utils/api';
import { Typography } from '@mui/material';

export default function SettingsPage() {
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((data) => {
        if (!cancelled) {
          setApiStatus(data.status ?? 'ok');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setApiError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SceneContent>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {routes.settings.base.title}
      </Typography>
      <Typography variant="body1">This is the settings page</Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        API health: {apiStatus ? apiStatus : apiError ? `error: ${apiError}` : 'checking...'}
      </Typography>
    </SceneContent>
  );
}
