'use client';

import { SceneContainer } from "@/app/_components/sceneContainer";
import { routes } from "@/app/_utils/routes";
import { Header } from "@/app/_components/Header";
import { RecipeList } from "@/app/_components/RecipeList";
import { mockRecipes } from "@/app/__mocks__/recipes";

export default function GroupPage() {
  return (
    <SceneContainer>
      <Header goBack title={routes.groups.view.title} />

      <RecipeList recipes={mockRecipes} />
    </SceneContainer>
  );
}
