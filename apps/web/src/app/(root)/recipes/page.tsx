'use client';

import { useState } from 'react';
import { mockRecipes } from '@/app/__mocks__/recipes';
import { ChipFilter, ChipOption } from '@/app/_components/ChipFilter';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { SearchInput } from '@/app/_components/SearchInput';
import { useSearchFilter } from '@/app/_hooks/useSearchFilter';
import { useTranslation } from 'react-i18next';

export default function RecipesPage() {
  const { filteredData, searchQuery, setSearchQuery } = useSearchFilter(mockRecipes, 'name');
  const { t } = useTranslation();
  const [selectedChip, setSelectedChip] = useState<ChipOption | undefined>();

  const chipOptions: ChipOption[] = [
    { label: t('recipes.myRecipes') },
    { label: t('recipes.savedRecipes') },
  ];

  const chipFilteredData = selectedChip
    ? filteredData.filter((recipe) => {
        if (selectedChip.label === t('recipes.myRecipes')) return recipe.isAuthor;
        if (selectedChip.label === t('recipes.savedRecipes')) return !recipe.isAuthor;
        return true;
      })
    : filteredData;

  return (
    <Scene>
      <Header>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.searchPlaceholder')}
          />
          <ChipFilter
            options={chipOptions}
            selectedOption={selectedChip}
            onSelect={setSelectedChip}
          />
      </Header>
      <SceneContent>
        <RecipeList recipes={chipFilteredData} />
      </SceneContent>
    </Scene>
  );
}
