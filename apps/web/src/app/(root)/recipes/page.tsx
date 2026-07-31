'use client';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { ChipFilter, type ChipOption } from '@/app/_components/ChipFilter';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { SearchInput } from '@/app/_components/SearchInput';
import { FloatingActionButton } from '@/app/_components/FloatingActionButton';
import { LoadingPage } from '@/app/_scenes/LoadingPage';
import { EmptyRecipeState } from '@/app/_components/EmptyState';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@/app/_hooks/useSearch';
import { useRecipesQuery } from '@/app/_hooks/recipes';
import { routes } from '@/app/_utils/routes';

export default function RecipesPage() {
  const { t } = useTranslation();
  const { searchQuery, handleSearchChange } = useSearch();
  const { data: recipes = [], isLoading } = useRecipesQuery(searchQuery || undefined);
  const [selectedChip, setSelectedChip] = useState<ChipOption | undefined>();

  const chipOptions: ChipOption[] = [
    { label: t('recipes.myRecipes') },
    { label: t('recipes.savedRecipes') },
  ];

  const chipFilteredData = selectedChip
    ? recipes.filter((recipe) => {
      if (selectedChip.label === t('recipes.myRecipes')) return recipe.isAuthor;
      if (selectedChip.label === t('recipes.savedRecipes')) return recipe.isSaved;
      return true;
    })
    : recipes;

  if (isLoading && recipes.length === 0) {
    return <LoadingPage />;
  }

  return (
    <Scene>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('search.searchPlaceholder')}
        />
        <ChipFilter
          options={chipOptions}
          selectedOption={selectedChip}
          onSelect={setSelectedChip}
        />
      </Header>
      {chipFilteredData.length > 0 && (
        <SceneContent>
          <RecipeList recipes={chipFilteredData} />
        </SceneContent>
      )}
      {chipFilteredData.length === 0 && <EmptyRecipeState />}
      <FloatingActionButton
        icon={<Add />}
        href={routes.recipes.create.path}
        label={t('recipes.fabCreateTooltip')}
      />
    </Scene>
  );
}
