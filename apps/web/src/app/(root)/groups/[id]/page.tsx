'use client';

import { SceneContent } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { mockRecipes } from '@/app/__mocks__/recipes';
import { useTranslation } from 'react-i18next';

export default function GroupPage() {
  const { t } = useTranslation();

  return (
    <SceneContent>
      <Header goBack title={t('groups.view.title')} />

      <RecipeList recipes={mockRecipes} />
    </SceneContent>
  );
}
