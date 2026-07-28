'use client';

import { SceneContent } from '@/app/_components/SceneComponents';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function EditGroupPage() {
  const { t } = useTranslation();

  return (
    <SceneContent>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {t('groups.edit.title')}
      </Typography>
      <Typography variant="body1">{t('groups.edit.description')}</Typography>
    </SceneContent>
  );
}
