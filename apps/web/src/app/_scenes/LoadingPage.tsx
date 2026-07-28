'use client';

import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CenteredFullPage } from '../_components/SceneComponents';
import { CircularProgress } from '@mui/material';

export function LoadingPage() {
  const { t } = useTranslation();

  return (
    <CenteredFullPage sx={{ alignItems: 'center' }}>
      <CircularProgress />
      <Typography>{t('common.loading')}</Typography>
    </CenteredFullPage>
  );
}
