'use client';

import { useState } from 'react';
import { Add, FileUpload } from '@mui/icons-material';
import { ChipFilter, type ChipOption } from '@/app/_components/ChipFilter';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { SearchInput } from '@/app/_components/SearchInput';
import { FloatingActionButton } from '@/app/_components/FloatingActionButton';
import { ContentSkeleton } from '@/app/_components/ContentSkeleton';
import { EmptyRecipeState } from '@/app/_components/EmptyState';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@/app/_hooks/useSearch';
import { useRecipesQuery } from '@/app/_hooks/recipes';
import { filterOwnAndSaved } from '@/app/_utils/recipeFilters';
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

  const ownAndSaved = filterOwnAndSaved(recipes);
  const chipFilteredData = selectedChip
    ? ownAndSaved.filter((recipe) => {
        if (selectedChip.label === t('recipes.myRecipes')) return recipe.isAuthor;
        if (selectedChip.label === t('recipes.savedRecipes')) return recipe.isSaved;
        return true;
      })
    : ownAndSaved;

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
          variant="solid"
        />
      </Header>
      <SceneContent sx={{ pt: 2 }}>
        {isLoading && recipes.length === 0 ? (
          <ContentSkeleton variant="rows" />
        ) : chipFilteredData.length > 0 ? (
          <RecipeList recipes={chipFilteredData} />
        ) : (
          <EmptyRecipeState
            actionLabel={t('recipes.newRecipe')}
            actionHref={routes.recipes.create.path}
          />
        )}
      </SceneContent>
      <FloatingActionButton
        icon={<Add />}
        href={routes.recipes.create.path}
        label={t('recipes.fabCreateTooltip')}
      />
      <FloatingActionButton
        icon={<FileUpload />}
        href={`${routes.recipes.create.path}?import=1`}
        label={t('recipes.fabImportTooltip')}
        sx={{ bottom: 144 }}
      />
    </Scene>
  );
}
