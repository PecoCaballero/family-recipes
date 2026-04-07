'use client';

import { useTranslation } from 'react-i18next';
import { Scene } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { SearchInput } from '@/app/_components/SearchInput';
import { EmptyRecipeState } from '@/app/_components/EmptyState';
import { useSearchFilter } from '@/app/_hooks/useSearchFilter';
import { mockRecipes } from '@/app/__mocks__/recipes';

export default function SearchPage() {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useSearchFilter(mockRecipes, 'name');

  return (
    <Scene>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search.searchPlaceholder')}
        />
      </Header>
      <EmptyRecipeState />
    </Scene>
  );
}
