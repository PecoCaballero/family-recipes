'use client';

import { ImportContacts } from '@mui/icons-material';
import { Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function EmptyRecipeState({ message }: { message?: string }) {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center" flex={1} justifyContent="center">
      <ImportContacts fontSize="large" />
      <Typography variant="h6" align="center" color="textSecondary">
        {t('recipes.noRecipes')} {message}
      </Typography>
    </Stack>
  );
}
