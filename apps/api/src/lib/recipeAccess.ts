import { prisma } from './prisma';

/**
 * Returns true when `userId` may view `recipeId` under the app's visibility
 * rule: the user is the author, the recipe is public, or the recipe is shared
 * with a group the user is a member of. Returns false for both "not visible"
 * and "does not exist" so callers can map the result to a 404 without leaking
 * existence.
 */
export async function canViewRecipe(userId: string, recipeId: string): Promise<boolean> {
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      OR: [
        { authorId: userId },
        { visibility: 'public' },
        { recipeGroups: { some: { group: { members: { some: { userId } } } } } },
      ],
    },
    select: { id: true },
  });
  return recipe !== null;
}
