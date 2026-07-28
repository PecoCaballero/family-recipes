'use client';

import { useTranslation } from 'react-i18next';
import { Scene } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { SearchInput } from '@/app/_components/SearchInput';
import { EmptyRecipeState } from '@/app/_components/EmptyState';
import { RecipeList } from '@/app/_components/RecipeList';
import { useSearch } from '@/app/_hooks/useSearch';
import { useRecipesQuery } from '@/app/_hooks/recipes';

export default function SearchPage() {
  const { t } = useTranslation();
  const { searchQuery, handleSearchChange } = useSearch();
  const trimmed = searchQuery.trim();
  const { data: results = [], isLoading } = useRecipesQuery(trimmed || undefined);
  const hasSearched = trimmed.length > 0 && !isLoading;

  return (
    <Scene>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('search.searchPlaceholder')}
        />
      </Header>
      {hasSearched && results.length === 0 && <EmptyRecipeState />}
      {results.length > 0 && <RecipeList recipes={results} />}
    </Scene>
  );
}
