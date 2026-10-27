'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { Stack, Typography, IconButton } from '@mui/material';
import { Header } from '@/app/_components/Header';
import { useParams, useRouter } from 'next/navigation';
import { LoadingPage } from '@/app/_scenes/LoadingPage';
import Image from 'next/image';
import RecipeMenu from '@/app/_components/RecipeMenu';
import { MoreVert } from '@mui/icons-material';
import { useAnchor } from '@/app/_hooks/useAnchor';
import { useRecipeQuery, useDeleteRecipe } from '@/app/_hooks/recipes';
import { recordRecentRecipe } from '@/app/_hooks/useRecentRecipes';
import { EmptyRecipeState } from '@/app/_components/EmptyState';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';
import { RecipeNesting } from '@/app/_components/RecipeNesting';
import { routes } from '@/app/_utils/routes';

export default function RecipePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    open: openMenu,
    anchor: menuAnchor,
    handleClick: handleMenuClick,
    handleClose: handleMenuClose,
  } = useAnchor();
  const params = useParams<{ id: string }>();
  const { data: recipe, isLoading } = useRecipeQuery(params.id);
  const deleteRecipe = useDeleteRecipe(params.id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const difficultyLabels: Record<string, string> = {
    easy: t('recipes.difficultyEasy'),
    medium: t('recipes.difficultyMedium'),
    hard: t('recipes.difficultyHard'),
  };

  const hasMetadata =
    recipe !== undefined &&
    (recipe.cuisine !== undefined ||
      recipe.prepTime !== undefined ||
      recipe.cookTime !== undefined ||
      recipe.servings !== undefined ||
      recipe.difficulty !== undefined);

  useEffect(() => {
    if (recipe) {
      recordRecentRecipe({ id: recipe.id, name: recipe.name, image: recipe.image });
    }
  }, [recipe]);

  const handleDelete = () => {
    setDeleteError(null);
    deleteRecipe.mutate(undefined, {
      onSuccess: () => {
        router.push(routes.recipes.base.path);
      },
      onError: () => {
        setDeleteError(t('common.error'));
      },
    });
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!recipe) {
    return (
      <Scene>
        <Header goBack title={t('recipes.notFound')} />
        <SceneContent sx={{ pt: 2 }}>
          <EmptyRecipeState message={t('recipes.notFound')} />
        </SceneContent>
      </Scene>
    );
  }

  return (
    <Scene>
      <Header
        goBack
        title={recipe.name}
        endSlot={
          <IconButton
            id="long-button"
            aria-label={t('recipes.moreOptions')}
            aria-controls={openMenu ? 'long-menu' : undefined}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            <MoreVert />
          </IconButton>
        }
      />
      <SceneContent sx={{ pt: 2 }}>
        <Typography variant="caption" textAlign="center">
          {recipe.author} • {t('recipes.lastUpdated')}:{' '}
          {new Date(recipe.lastUpdated).toLocaleDateString()}
        </Typography>
        <Typography padding={2}>{recipe.description}</Typography>
        {recipe.image && (
          <Image
            src={recipe.image}
            alt={t('recipes.imageAlt', { name: recipe.name, description: recipe.description })}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
          />
        )}

        {hasMetadata && (
          <Stack spacing={0.5} paddingX={2} paddingTop={2}>
            {recipe.cuisine && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">{t('recipes.cuisine')}</Typography>
                <Typography>{recipe.cuisine}</Typography>
              </Stack>
            )}
            {recipe.prepTime !== undefined && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">{t('recipes.prepTime')}</Typography>
                <Typography>
                  {recipe.prepTime} {t('recipes.minutesShort')}
                </Typography>
              </Stack>
            )}
            {recipe.cookTime !== undefined && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">{t('recipes.cookTime')}</Typography>
                <Typography>
                  {recipe.cookTime} {t('recipes.minutesShort')}
                </Typography>
              </Stack>
            )}
            {recipe.servings !== undefined && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">{t('recipes.servings')}</Typography>
                <Typography>{recipe.servings}</Typography>
              </Stack>
            )}
            {recipe.difficulty && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">{t('recipes.difficulty')}</Typography>
                <Typography>{difficultyLabels[recipe.difficulty]}</Typography>
              </Stack>
            )}
          </Stack>
        )}

        <Typography variant="h4" textAlign="center" paddingTop={3} paddingBottom={1}>
          {t('recipes.ingredients')}
        </Typography>
        {recipe.ingredients.map((ingredient) => (
          <Stack
            key={ingredient.name}
            direction="row"
            justifyContent="space-between"
            paddingX={2}
            gap={1}
          >
            <Typography>{ingredient.name}</Typography>
            <Typography>
              {ingredient.quantity}
              {ingredient.unit && ` ${ingredient.unit}`}
            </Typography>
          </Stack>
        ))}

        <Typography variant="h4" textAlign="center" paddingTop={3} paddingBottom={1}>
          {t('recipes.instructions')}
        </Typography>
        <Typography paddingX={2} textAlign="justify">
          {recipe.instructions}
        </Typography>

        <RecipeNesting parent={recipe.parentRecipe} variations={recipe.nestedRecipes} />
      </SceneContent>
      <RecipeMenu
        recipe={recipe}
        anchorEl={menuAnchor}
        open={openMenu}
        onClose={handleMenuClose}
        onDelete={() => setDeleteOpen(true)}
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('recipes.deleteRecipe')}
        message={t('recipes.deleteConfirm')}
        error={deleteError}
        onConfirm={handleDelete}
        loading={deleteRecipe.isPending}
        confirmLabel={t('common.delete')}
      />
    </Scene>
  );
}
