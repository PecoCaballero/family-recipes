'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { SearchInput } from '@/app/_components/SearchInput';
import { EmptyRecipeState } from '@/app/_components/EmptyState';
import { RecipeList } from '@/app/_components/RecipeList';
import { ListRow } from '@/app/_components/ListRow';
import { SafeAvatar } from '@/app/_components/SafeAvatar';
import { ContentSkeleton } from '@/app/_components/ContentSkeleton';
import { useSearch } from '@/app/_hooks/useSearch';
import { useRecentRecipes } from '@/app/_hooks/useRecentRecipes';
import { useRecipesQuery } from '@/app/_hooks/recipes';
import {
  usePantryQuery,
  useAddPantryItem,
  useRemovePantryItem,
  usePantrySuggestionsQuery,
} from '@/app/_hooks/pantry';
import type { PantrySuggestion } from '@family-recipe/shared';

type SearchMode = 'recipes' | 'pantry';

export default function SearchPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>('recipes');
  const { searchQuery, handleSearchChange } = useSearch();
  const trimmed = searchQuery.trim();
  const recent = useRecentRecipes();
  const { data: results = [], isLoading } = useRecipesQuery(
    trimmed || undefined,
    mode === 'recipes' && trimmed.length > 0,
  );

  const pantry = usePantryQuery();
  const suggestions = usePantrySuggestionsQuery();
  const addPantryItem = useAddPantryItem();
  const removePantryItem = useRemovePantryItem();
  const [pantryName, setPantryName] = useState('');

  const handleAddPantryItem = () => {
    const name = pantryName.trim();
    if (!name) return;
    addPantryItem.mutate(name, { onSuccess: () => setPantryName('') });
  };

  const canMake = suggestions.data?.filter((s) => s.status === 'canMake') ?? [];
  const almost = suggestions.data?.filter((s) => s.status === 'almost') ?? [];

  return (
    <Scene>
      <Header>
        <ToggleButtonGroup
          exclusive
          value={mode}
          onChange={(_event, value: SearchMode | null) => {
            if (value !== null) setMode(value);
          }}
          size="small"
          fullWidth
        >
          <ToggleButton value="recipes">{t('recipes.title')}</ToggleButton>
          <ToggleButton value="pantry">{t('pantry.title')}</ToggleButton>
        </ToggleButtonGroup>
        {mode === 'recipes' ? (
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('search.searchPlaceholder')}
          />
        ) : (
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              value={pantryName}
              onChange={(e) => setPantryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddPantryItem();
              }}
              placeholder={t('pantry.addPlaceholder')}
            />
            <Button
              variant="contained"
              onClick={handleAddPantryItem}
              disabled={!pantryName.trim() || addPantryItem.isPending}
              startIcon={<AddIcon />}
              sx={{ flexShrink: 0 }}
            >
              {t('pantry.add')}
            </Button>
          </Stack>
        )}
      </Header>
      <SceneContent>
        {mode === 'recipes' ? (
          trimmed.length === 0 ? (
            recent.length > 0 ? (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, pt: 2 }}>
                  {t('search.recent')}
                </Typography>
                <Stack spacing={1} sx={{ px: 2, pt: 1 }}>
                  {recent.map((item) => (
                    <ListRow
                      key={item.id}
                      leading={<SafeAvatar src={item.image} fallback={item.name.charAt(0)} />}
                      title={item.name}
                      onClick={() => router.push(`/recipes/${item.id}`)}
                    />
                  ))}
                </Stack>
              </>
            ) : (
              <EmptyRecipeState message={t('search.recentEmpty')} />
            )
          ) : isLoading && results.length === 0 ? (
            <ContentSkeleton variant="rows" />
          ) : results.length > 0 ? (
            <RecipeList recipes={results} />
          ) : (
            <EmptyRecipeState message={t('search.noResults')} />
          )
        ) : (
          <Stack spacing={2} sx={{ px: 2, pt: 2 }}>
            {pantry.isLoading ? (
              <ContentSkeleton variant="rows" />
            ) : pantry.data && pantry.data.length > 0 ? (
              <Stack spacing={1}>
                {pantry.data.map((item) => (
                  <Card
                    key={item.id}
                    variant="outlined"
                    sx={{ borderRadius: 2, overflow: 'hidden' }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <IconButton
                        aria-label={t('pantry.remove')}
                        onClick={() => removePantryItem.mutate(item.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('pantry.empty')}
              </Typography>
            )}

            <Button variant="outlined" onClick={() => suggestions.refetch()}>
              {t('pantry.findRecipes')}
            </Button>

            {suggestions.isLoading ? (
              <ContentSkeleton variant="rows" />
            ) : canMake.length === 0 && almost.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('pantry.noSuggestions')}
              </Typography>
            ) : (
              <>
                {canMake.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('pantry.youCanMake')}
                    </Typography>
                    <RecipeList recipes={canMake.map((s) => s.recipe)} />
                  </>
                )}
                {almost.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('pantry.almostThere')}
                    </Typography>
                    <Stack spacing={1}>
                      {almost.map((s: PantrySuggestion) => (
                        <ListRow
                          key={s.recipe.id}
                          leading={
                            <SafeAvatar src={s.recipe.image} fallback={s.recipe.name.charAt(0)} />
                          }
                          title={s.recipe.name}
                          subtitle={
                            s.missingCount === 1
                              ? t('pantry.missing_one', {
                                  missing: s.missingIngredients.join(', '),
                                })
                              : t('pantry.missing_other', {
                                  missing: s.missingIngredients.join(', '),
                                })
                          }
                          onClick={() => router.push(`/recipes/${s.recipe.id}`)}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </>
            )}
          </Stack>
        )}
      </SceneContent>
    </Scene>
  );
}
