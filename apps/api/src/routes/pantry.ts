import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { addPantryItemInputSchema } from '@family-recipe/shared';
import { formatRecipe } from './recipes';

export const pantryRouter = Router();

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function isCovered(pantryNames: string[], ingredientName: string): boolean {
  const target = normalizeName(ingredientName);
  if (!target) return false;
  return pantryNames.some((pantry) => normalizeName(pantry) === target);
}

export function scoreRecipeCoverage(
  ingredients: { name: string }[],
  pantryNames: string[],
): { status: 'canMake' | 'almost'; missingCount: number; missingIngredients: string[] } {
  const missingIngredients = ingredients
    .filter((ing) => !isCovered(pantryNames, ing.name))
    .map((ing) => ing.name);
  return {
    status: missingIngredients.length === 0 ? 'canMake' : 'almost',
    missingCount: missingIngredients.length,
    missingIngredients,
  };
}

pantryRouter.get('/', async (req, res) => {
  try {
    const items = await prisma.pantryItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json({ items: items.map((item) => ({ id: item.id, name: item.name })) });
  } catch (error) {
    console.error('List pantry error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

pantryRouter.post('/', async (req, res) => {
  try {
    const parsed = addPantryItemInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { name } = parsed.data;
    const normalized = normalizeName(name);

    const existing = await prisma.pantryItem.findMany({
      where: { userId: req.userId },
      select: { name: true },
    });
    if (existing.some((item) => normalizeName(item.name) === normalized)) {
      return res.status(409).json({ error: 'pantry_item_exists' });
    }

    const item = await prisma.pantryItem.create({
      data: { userId: req.userId!, name },
    });
    return res.status(201).json({ id: item.id, name: item.name });
  } catch (error) {
    console.error('Add pantry item error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

pantryRouter.get('/suggest', async (req, res) => {
  try {
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId: req.userId },
      select: { name: true },
    });
    const pantryNames = pantryItems.map((item) => item.name);

    if (pantryNames.length === 0) {
      return res.status(200).json({ suggestions: [] });
    }

    const userGroups = await prisma.groupMember.findMany({
      where: { userId: req.userId },
      select: { groupId: true },
    });
    const groupIds = userGroups.map((g) => g.groupId);

    const visibilityConditions: Record<string, unknown>[] = [
      { authorId: req.userId },
      { visibility: 'public' },
    ];
    if (groupIds.length > 0) {
      visibilityConditions.push({
        recipeGroups: { some: { groupId: { in: groupIds } } },
      });
    }

    const recipes = await prisma.recipe.findMany({
      where: { OR: visibilityConditions },
      include: { ingredients: true },
      orderBy: { lastUpdated: 'desc' },
    });

    const scored = recipes
      .map((recipe) => ({
        recipe,
        ...scoreRecipeCoverage(recipe.ingredients, pantryNames),
      }))
      .filter((s) => s.status === 'canMake' || s.missingCount <= 2)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'canMake' ? -1 : 1;
        if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
        return b.recipe.lastUpdated.getTime() - a.recipe.lastUpdated.getTime();
      })
      .slice(0, 50);

    const suggestions = await Promise.all(
      scored.map(async (s) => ({
        recipe: await formatRecipe(s.recipe, req.userId!),
        status: s.status,
        missingCount: s.missingCount,
        missingIngredients: s.missingIngredients,
      })),
    );

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Suggest recipes error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

pantryRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.pantryItem.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'pantry_item_not_found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Delete pantry item error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});
