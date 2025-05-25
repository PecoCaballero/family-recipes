'use client';

import { SceneContainer } from "@/app/_components/sceneContainer";
import { mockRecipes } from "@/app/__mocks__/recipes";
import { RecipeList } from "@/app/_components/RecipeList";

export default function RecipesPage() {
  return (
    <SceneContainer>
      <RecipeList recipes={mockRecipes} />
    </SceneContainer>
  );
}
