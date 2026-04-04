'use client';

import { mockRecipes } from '@/app/__mocks__/recipes';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { SearchInput } from '@/app/_components/SearchInput';
import { useSearchFilter } from '@/app/_hooks/useSearchFilter';
import { useTranslation } from 'react-i18next';

export default function RecipesPage() {
  const { filteredData, searchQuery, setSearchQuery } = useSearchFilter(mockRecipes, 'name');
  const { t } = useTranslation();

  return (
    <Scene>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search.searchPlaceholder')}
        />
      </Header>
      <SceneContent>
        <RecipeList recipes={filteredData} />
      </SceneContent>
    </Scene>
  );
}
