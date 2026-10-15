import type { Recipe } from '@family-recipe/shared';

/** Recipes the user authored or saved (the Recipes-tab default scope). */
export function filterOwnAndSaved(recipes: Recipe[]): Recipe[] {
  return recipes.filter((recipe) => recipe.isAuthor || recipe.isSaved);
}

/** Case-insensitive match over recipe title and description. */
export function filterRecipesByQuery(recipes: Recipe[], query: string): Recipe[] {
  const term = query.trim().toLowerCase();
  if (!term) return recipes;
  return recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(term) || recipe.description.toLowerCase().includes(term),
  );
}
