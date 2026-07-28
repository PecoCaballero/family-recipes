import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  ingredientSchema,
  prismaIngredientSchema,
  createRecipeInputSchema,
  updateRecipeInputSchema,
} from '@family-recipe/shared';
import type { Recipe, Ingredient } from '@family-recipe/shared';

export const recipeRouter = Router();

const recipeDbSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  author: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  description: z.string(),
  instructions: z.string(),
  lastUpdated: z.date(),
  ingredients: z.array(prismaIngredientSchema),
});

async function formatRecipe(raw: unknown, userId: string): Promise<Recipe> {
  const dbRecipe = recipeDbSchema.parse(raw);

  const isAuthor = dbRecipe.authorId === userId;

  const savedCount = await prisma.savedRecipe.count({
    where: { userId, recipeId: dbRecipe.id },
  });

  const children = await prisma.recipe.findMany({
    where: { parentRecipeId: dbRecipe.id },
  });

  const ingredients: Ingredient[] = dbRecipe.ingredients.map((ing) => ({
    name: ing.name,
    unit: ing.unit ?? undefined,
    quantity: ing.quantity,
  }));

  return {
    id: dbRecipe.id,
    authorId: dbRecipe.authorId,
    author: dbRecipe.author,
    name: dbRecipe.name,
    image: dbRecipe.image ?? undefined,
    description: dbRecipe.description,
    ingredients,
    instructions: dbRecipe.instructions,
    lastUpdated: dbRecipe.lastUpdated.toISOString(),
    nestedRecipeIds: children.map((c: { id: string }) => c.id),
    groupIds: [],
    savedByIds: [],
    isAuthor,
    isSaved: savedCount > 0,
  };
}

recipeRouter.get('/', async (req, res) => {
  try {
    const query = String(req.query.search || '').trim();

    const where: Record<string, unknown> = {};
    if (query) {
      where['OR'] = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        {
          ingredients: {
            some: { name: { contains: query, mode: 'insensitive' } },
          },
        },
      ];
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: { ingredients: true },
      orderBy: { lastUpdated: 'desc' },
    });

    const items = await Promise.all(
      recipes.map((r: Record<string, unknown>) => formatRecipe(r, req.userId!)),
    );

    return res.status(200).json({ recipes: items });
  } catch (error) {
    console.error('List recipes error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

recipeRouter.get('/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
      include: { ingredients: true },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    const formatted = await formatRecipe(recipe, req.userId!);
    return res.status(200).json({ recipe: formatted });
  } catch (error) {
    console.error('Get recipe error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

recipeRouter.post('/', async (req, res) => {
  try {
    const parsed = createRecipeInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { name, description, image, ingredients, instructions, parentRecipeId } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const authorName = user?.name ?? 'Unknown';

    const recipe = await prisma.recipe.create({
      data: {
        authorId: req.userId!,
        author: authorName,
        name,
        description,
        image: image || null,
        instructions,
        parentRecipeId: parentRecipeId || null,
        ingredients: {
          create: ingredients.map((ing) => ({
            name: ing.name,
            unit: ing.unit || null,
            quantity: ing.quantity,
          })),
        },
      },
      include: { ingredients: true },
    });

    const formatted = await formatRecipe(recipe, req.userId!);
    return res.status(201).json({ recipe: formatted });
  } catch (error) {
    console.error('Create recipe error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

recipeRouter.patch('/:id', async (req, res) => {
  try {
    const existing = await prisma.recipe.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const parsed = updateRecipeInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { name, description, image, ingredients, instructions, parentRecipeId } = parsed.data;

    await prisma.$transaction([
      prisma.recipe.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(instructions !== undefined && { instructions }),
          ...(parentRecipeId !== undefined && { parentRecipeId }),
          lastUpdated: new Date(),
        },
        include: { ingredients: true },
      }),
      ...(ingredients !== undefined
        ? [
            prisma.ingredient.deleteMany({ where: { recipeId: req.params.id } }),
            prisma.ingredient.createMany({
              data: ingredients.map((ing) => ({
                recipeId: req.params.id,
                name: ing.name,
                unit: ing.unit || null,
                quantity: ing.quantity,
              })),
            }),
          ]
        : []),
    ]);

    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
      include: { ingredients: true },
    });

    const formatted = await formatRecipe(recipe, req.userId!);
    return res.status(200).json({ recipe: formatted });
  } catch (error) {
    console.error('Update recipe error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

recipeRouter.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.recipe.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    await prisma.recipe.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Delete recipe error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

recipeRouter.post('/:id/save', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    await prisma.savedRecipe.upsert({
      where: {
        userId_recipeId: {
          userId: req.userId!,
          recipeId: req.params.id,
        },
      },
      create: {
        userId: req.userId!,
        recipeId: req.params.id,
      },
      update: {},
    });

    return res.status(200).json({ status: 'saved' });
  } catch (error) {
    console.error('Save recipe error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

recipeRouter.post('/:id/unsave', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    await prisma.savedRecipe.deleteMany({
      where: {
        userId: req.userId!,
        recipeId: req.params.id,
      },
    });

    return res.status(200).json({ status: 'unsaved' });
  } catch (error) {
    console.error('Unsave recipe error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

recipeRouter.post('/:id/groups', async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) {
      return res.status(400).json({ error: 'group_id_required' });
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ error: 'group_not_found' });
    }

    await prisma.recipeGroup.upsert({
      where: {
        recipeId_groupId: {
          recipeId: req.params.id,
          groupId,
        },
      },
      create: {
        recipeId: req.params.id,
        groupId,
      },
      update: {},
    });

    return res.status(200).json({ status: 'added_to_group', groupId });
  } catch (error) {
    console.error('Add recipe to group error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});
