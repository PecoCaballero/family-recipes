'use client';

import { Header } from '@/app/_components/Header';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { RecipeForm } from './RecipeForm';
import { LoadingPage } from './LoadingPage';
import { useRecipeQuery, useCreateRecipe, useUpdateRecipe, useDeleteRecipe } from '../_hooks/recipes';
import type { Recipe } from '@family-recipe/shared';

type PpRecipeFormScene = {
  isEditing?: boolean;
};

export function RecipeFormScene({ isEditing = false }: PpRecipeFormScene) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const recipeId = params?.id;

  const { data: recipe, isLoading: loadingRecipe } = useRecipeQuery(
    isEditing && recipeId ? recipeId : '',
  );
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe(recipeId ?? '');
  const deleteMutation = useDeleteRecipe(recipeId ?? '');

  const handleSubmit = async (formData: {
    name: string;
    description: string;
    image?: string;
    ingredients: { name: string; unit?: string; quantity: string }[];
    instructions: string;
  }) => {
    if (isEditing && recipeId) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
    router.push('/recipes');
  };

  const handleDelete = async () => {
    if (!recipeId) return;
    await deleteMutation.mutateAsync();
    router.push('/recipes');
  };

  if (isEditing && loadingRecipe) {
    return <LoadingPage />;
  }

  if (isEditing && !recipe) {
    return <LoadingPage />;
  }

  const initialRecipe: Recipe = recipe || {
    id: '',
    authorId: '',
    author: '',
    name: '',
    description: '',
    ingredients: [],
    instructions: '',
    lastUpdated: new Date().toISOString(),
    groupIds: [],
    savedByIds: [],
  };

  return (
    <Scene>
      <Header goBack title={isEditing ? t('recipes.editRecipe') : t('recipes.newRecipe')} />
      <SceneContent>
        <RecipeForm recipe={initialRecipe} isEditing={isEditing} onSubmit={handleSubmit} />
      </SceneContent>
    </Scene>
  );
}
