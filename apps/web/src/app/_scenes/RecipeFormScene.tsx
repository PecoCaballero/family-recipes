'use client';

import { useRef, useState } from 'react';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Header } from '@/app/_components/Header';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { RecipeForm, type RecipeFormHandle } from './RecipeForm';
import { RecipeImportStep } from './RecipeImportStep';
import { LoadingPage } from './LoadingPage';
import { useRecipeQuery, useCreateRecipe, useUpdateRecipe } from '../_hooks/recipes';
import type { Recipe, RecipeImportDraft } from '@family-recipe/shared';

type PpRecipeFormScene = {
  isEditing?: boolean;
};

export function RecipeFormScene({ isEditing = false }: PpRecipeFormScene) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const recipeId = params?.id;
  const importMode = !isEditing && searchParams.get('import') === '1';
  const [importDraft, setImportDraft] = useState<RecipeImportDraft | null>(null);
  const [tab, setTab] = useState(0);
  const formRef = useRef<RecipeFormHandle>(null);

  const { data: recipe, isLoading: loadingRecipe } = useRecipeQuery(
    isEditing && recipeId ? recipeId : '',
  );
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe(recipeId ?? '');

  const handleSubmit = async (formData: {
    name: string;
    description: string;
    image?: string;
    ingredients: { name: string; unit?: string; quantity: string }[];
    instructions: string;
    parentRecipeId?: string;
  }) => {
    if (isEditing && recipeId) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
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

  if (!importMode) {
    return (
      <Scene>
        <Header goBack title={isEditing ? t('recipes.editRecipe') : t('recipes.newRecipe')} />
        <SceneContent>
          <RecipeForm
            recipe={initialRecipe}
            isEditing={isEditing}
            initialData={importDraft ?? undefined}
            onSubmit={handleSubmit}
          />
        </SceneContent>
      </Scene>
    );
  }

  if (!importDraft) {
    return (
      <Scene>
        <Header goBack title={t('recipes.importRecipe')} />
        <SceneContent>
          <RecipeImportStep
            onDraft={(draft) => {
              setImportDraft(draft);
              setTab(0);
            }}
          />
        </SceneContent>
      </Scene>
    );
  }

  return (
    <Scene>
      <Header goBack title={t('recipes.importRecipe')} />
      <Tabs value={tab} onChange={(_event, value: number) => setTab(value)} variant="fullWidth">
        <Tab label={t('recipes.importPreview')} />
        <Tab label={t('common.edit')} />
      </Tabs>
      <SceneContent>
        <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
          <Stack spacing={2} sx={{ px: 2, py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {importDraft.name}
            </Typography>
            {importDraft.description && (
              <Typography variant="body2" color="text.secondary">
                {importDraft.description}
              </Typography>
            )}
            <Typography variant="subtitle2">{t('recipes.ingredients')}</Typography>
            <Box component="ul" sx={{ mt: 0, pl: 2 }}>
              {importDraft.ingredients.map((ing, index) => (
                <li key={index}>{[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}</li>
              ))}
            </Box>
            <Typography variant="subtitle2">{t('recipes.instructions')}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {importDraft.instructions}
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
          <RecipeForm
            ref={formRef}
            recipe={initialRecipe}
            isEditing={false}
            initialData={importDraft}
            hideActions
            onSubmit={handleSubmit}
          />
        </Box>
      </SceneContent>
      <Stack
        direction="row"
        gap={2}
        sx={{
          px: 2,
          py: 2,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <Button variant="contained" sx={{ flex: 1 }} onClick={() => formRef.current?.submitForm()}>
          {t('recipes.saveRecipe')}
        </Button>
        <Button variant="outlined" onClick={() => router.push('/recipes')}>
          {t('common.cancel')}
        </Button>
      </Stack>
    </Scene>
  );
}
