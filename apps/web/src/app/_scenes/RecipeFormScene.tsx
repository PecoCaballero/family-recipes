'use client';

import { Header } from '@/app/_components/Header';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { RecipeForm } from './RecipeForm';
import { mockRecipes } from '../__mocks__/recipes';
import { LoadingPage } from './LoadingPage';

type PpRecipeFormScene = {
  isEditing?: boolean;
};

export function RecipeFormScene({ isEditing = false }: PpRecipeFormScene) {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const recipeId = params?.id;
  const recipe = isEditing && recipeId ? mockRecipes.find((r) => r.id === recipeId) : undefined;

  if (!recipe) {
    return <LoadingPage />;
  }

  return (
    <Scene>
      <Header goBack title={isEditing ? t('recipes.editRecipe') : t('recipes.newRecipe')} />
      <SceneContent>
        <RecipeForm recipe={recipe} isEditing={isEditing} />
      </SceneContent>
    </Scene>
  );
}
