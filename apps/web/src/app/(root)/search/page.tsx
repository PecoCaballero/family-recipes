'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Stack, Typography } from '@mui/material';
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

export default function SearchPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { searchQuery, handleSearchChange } = useSearch();
  const trimmed = searchQuery.trim();
  const recent = useRecentRecipes();
  const { data: results = [], isLoading } = useRecipesQuery(
    trimmed || undefined,
    trimmed.length > 0,
  );

  return (
    <Scene>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('search.searchPlaceholder')}
        />
      </Header>
      <SceneContent>
        {trimmed.length === 0 ? (
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
        )}
      </SceneContent>
    </Scene>
  );
}
