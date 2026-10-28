import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  prismaIngredientSchema,
  createRecipeInputSchema,
  updateRecipeInputSchema,
  recipeImportRequestSchema,
} from '@family-recipe/shared';
import type { Recipe, Ingredient } from '@family-recipe/shared';
import { importRecipeDraft, ImportError } from '../lib/recipeImport';
import { canViewRecipe } from '../lib/recipeAccess';

export const recipeRouter = Router();

const recipeDbSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  author: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  description: z.string(),
  instructions: z.string(),
  cuisine: z.string().nullable().optional(),
  prepTime: z.number().int().nullable().optional(),
  cookTime: z.number().int().nullable().optional(),
  servings: z.number().int().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  lastUpdated: z.date(),
  parentRecipeId: z.string().nullable().optional(),
  ingredients: z.array(prismaIngredientSchema),
});

export async function formatRecipe(raw: unknown, userId: string): Promise<Recipe> {
  const dbRecipe = recipeDbSchema.parse(raw);

  const isAuthor = dbRecipe.authorId === userId;

  const savedCount = await prisma.savedRecipe.count({
    where: { userId, recipeId: dbRecipe.id },
  });

  const children = await prisma.recipe.findMany({
    where: { parentRecipeId: dbRecipe.id },
    select: { id: true, name: true },
  });

  const parent = dbRecipe.parentRecipeId
    ? await prisma.recipe.findUnique({
        where: { id: dbRecipe.parentRecipeId },
        select: { id: true, name: true },
      })
    : null;

  const recipeGroups = await prisma.recipeGroup.findMany({
    where: { recipeId: dbRecipe.id },
    select: { groupId: true },
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
    cuisine: dbRecipe.cuisine ?? undefined,
    prepTime: dbRecipe.prepTime ?? undefined,
    cookTime: dbRecipe.cookTime ?? undefined,
    servings: dbRecipe.servings ?? undefined,
    difficulty: (dbRecipe.difficulty ?? undefined) as Recipe['difficulty'],
    lastUpdated: dbRecipe.lastUpdated.toISOString(),
    nestedRecipeIds: children.map((c) => c.id),
    nestedRecipes: children.map((c) => ({ id: c.id, name: c.name })),
    parentRecipe: parent ? { id: parent.id, name: parent.name } : undefined,
    groupIds: recipeGroups.map((rg: { groupId: string }) => rg.groupId),
    savedByIds: [],
    isAuthor,
    isSaved: savedCount > 0,
  };
}

recipeRouter.get('/', async (req, res) => {
  try {
    const query = String(req.query.search || '').trim();

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

    const where: Record<string, unknown> = {
      OR: visibilityConditions,
    };
    if (query) {
      where['AND'] = [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            {
              ingredients: {
                some: { name: { contains: query, mode: 'insensitive' } },
              },
            },
          ],
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

recipeRouter.post('/import', async (req, res) => {
  const parsed = recipeImportRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'validation_error',
      details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
  }

  try {
    const draft = await importRecipeDraft(parsed.data.text);
    return res.status(200).json({ draft });
  } catch (error) {
    if (error instanceof ImportError) {
      const status = {
        ai_not_configured: 503,
        ai_upstream_error: 502,
        import_unparseable: 422,
      }[error.code];
      return res.status(status).json({ error: error.code });
    }
    console.error('Import recipe error:', error);
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

    if (!(await canViewRecipe(req.userId!, recipe.id))) {
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

    if (parentRecipeId) {
      const parent = await prisma.recipe.findUnique({
        where: { id: parentRecipeId },
        select: { id: true },
      });
      if (!parent) {
        return res.status(400).json({
          error: 'validation_error',
          details: ['parentRecipeId: parent recipe not found'],
        });
      }
    }

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
        cuisine: parsed.data.cuisine ?? null,
        prepTime: parsed.data.prepTime ?? null,
        cookTime: parsed.data.cookTime ?? null,
        servings: parsed.data.servings ?? null,
        difficulty: parsed.data.difficulty ?? null,
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

    if (parentRecipeId !== undefined) {
      if (parentRecipeId === req.params.id) {
        return res.status(400).json({
          error: 'validation_error',
          details: ['parentRecipeId: a recipe cannot be its own parent'],
        });
      }
      if (parentRecipeId) {
        const parent = await prisma.recipe.findUnique({
          where: { id: parentRecipeId },
          select: { id: true },
        });
        if (!parent) {
          return res.status(400).json({
            error: 'validation_error',
            details: ['parentRecipeId: parent recipe not found'],
          });
        }
      }
    }

    await prisma.$transaction([
      prisma.recipe.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(instructions !== undefined && { instructions }),
          ...(parentRecipeId !== undefined && { parentRecipeId }),
          ...(parsed.data.cuisine !== undefined && { cuisine: parsed.data.cuisine }),
          ...(parsed.data.prepTime !== undefined && { prepTime: parsed.data.prepTime }),
          ...(parsed.data.cookTime !== undefined && { cookTime: parsed.data.cookTime }),
          ...(parsed.data.servings !== undefined && { servings: parsed.data.servings }),
          ...(parsed.data.difficulty !== undefined && { difficulty: parsed.data.difficulty }),
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

    if (!(await canViewRecipe(req.userId!, recipe.id))) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ error: 'group_not_found' });
    }

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.userId! } },
    });
    if (!membership) {
      return res.status(403).json({ error: 'forbidden' });
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
