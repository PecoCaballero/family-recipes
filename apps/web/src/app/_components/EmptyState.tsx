'use client';

import { ImportContacts, GroupWork } from '@mui/icons-material';
import { Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function EmptyRecipeState({ message }: { message?: string }) {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center" flex={1} justifyContent="center">
      <ImportContacts fontSize="large" />
      <Typography variant="h6" align="center" color="textSecondary">
        {message ?? t('recipes.noRecipes')}
      </Typography>
    </Stack>
  );
}

export function EmptyGroupState({ message }: { message?: string }) {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center" flex={1} justifyContent="center">
      <GroupWork fontSize="large" />
      <Typography variant="h6" align="center" color="textSecondary">
        {message ?? t('groups.noGroups')}
      </Typography>
    </Stack>
  );
}
