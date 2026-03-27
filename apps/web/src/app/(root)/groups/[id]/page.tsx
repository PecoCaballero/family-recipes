'use client';

import { SceneContent } from '@/app/_components/SceneComponents';
import { routes } from '@/app/_utils/routes';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { mockRecipes } from '@/app/__mocks__/recipes';

export default function GroupPage() {
  return (
    <SceneContent>
      <Header goBack title={routes.groups.view.title} />

      <RecipeList recipes={mockRecipes} />
    </SceneContent>
  );
}
