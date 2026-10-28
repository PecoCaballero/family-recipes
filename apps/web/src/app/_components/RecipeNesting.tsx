'use client';

import { Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ListRow } from './ListRow';
import type { RecipeSummary } from '@family-recipe/shared';

type PpRecipeNesting = {
  parent?: RecipeSummary;
  variations?: RecipeSummary[];
};

export function RecipeNesting({ parent, variations }: PpRecipeNesting) {
  const { t } = useTranslation();
  const router = useRouter();
  const hasVariations = Boolean(variations && variations.length > 0);

  if (!parent && !hasVariations) {
    return null;
  }

  return (
    <Stack spacing={1} sx={{ px: 2, pt: 3 }}>
      {parent && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" color="text.secondary">
            {t('recipes.basedOn')}:
          </Typography>
          <Button component={Link} href={`/recipes/${parent.id}`} size="small" variant="text">
            {parent.name}
          </Button>
        </Stack>
      )}
      {hasVariations && (
        <Stack spacing={1}>
          <Typography variant="h6">{t('recipes.variations')}</Typography>
          {variations!.map((variation) => (
            <ListRow
              key={variation.id}
              title={variation.name}
              onClick={() => router.push(`/recipes/${variation.id}`)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
