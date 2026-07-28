'use client';

import { useTranslation } from 'react-i18next';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { Stack, Typography, IconButton } from '@mui/material';
import { Header } from '@/app/_components/Header';
import { useParams } from 'next/navigation';
import { LoadingPage } from '@/app/_scenes/LoadingPage';
import Image from 'next/image';
import RecipeMenu from '@/app/_components/RecipeMenu';
import { MoreVert } from '@mui/icons-material';
import { useAnchor } from '@/app/_hooks/useAnchor';
import { useRecipeQuery } from '@/app/_hooks/recipes';
import { EmptyRecipeState } from '@/app/_components/EmptyState';

export default function RecipePage() {
  const { t } = useTranslation();
  const {
    open: openMenu,
    anchor: menuAnchor,
    handleClick: handleMenuClick,
    handleClose: handleMenuClose,
  } = useAnchor();
  const params = useParams<{ id: string }>();
  const { data: recipe, isLoading } = useRecipeQuery(params.id);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!recipe) {
    return (
      <Scene>
        <Header goBack title={t('recipes.notFound')} />
        <SceneContent>
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
            aria-controls={openMenu ? 'long-menu' : undefined}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            <MoreVert />
          </IconButton>
        }
      />
      <SceneContent>
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
      </SceneContent>
      <RecipeMenu recipe={recipe} anchorEl={menuAnchor} open={openMenu} onClose={handleMenuClose} />
    </Scene>
  );
}
