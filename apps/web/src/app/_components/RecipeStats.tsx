'use client';

import { Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type PpRecipeStats = {
  recipesSaved: number;
  recipesShared: number;
};

export function RecipeStats({ recipesSaved, recipesShared }: PpRecipeStats): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={3} sx={{ paddingBottom: 4 }} justifyContent="space-around">
      <Stack alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {recipesSaved}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('account.recipesSaved')}
        </Typography>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Stack alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {recipesShared}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('account.sharedByOthers')}
        </Typography>
      </Stack>
    </Stack>
  );
}
