'use client';

import { ImportContacts } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CenteredFullPage } from './SceneComponents';

export function EmptyRecipeState({ message }: { message?: string }) {
  const { t } = useTranslation();

  return (
    <CenteredFullPage sx={{ alignItems: 'center' }}>
      <ImportContacts fontSize="large" />
      <Typography variant="h6" align="center" color="textSecondary">
        {t('recipes.noRecipes')} {message}
      </Typography>
    </CenteredFullPage>
  );
}
