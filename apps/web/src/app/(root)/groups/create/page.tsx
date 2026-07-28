'use client';

import { SceneContent } from '@/app/_components/SceneComponents';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function CreateGroupPage() {
  const { t } = useTranslation();

  return (
    <SceneContent>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {t('groups.create.title')}
      </Typography>
      <Typography variant="body1">{t('groups.create.description')}</Typography>
    </SceneContent>
  );
}
