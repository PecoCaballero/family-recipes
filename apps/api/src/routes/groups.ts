import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { createGroupInputSchema, updateGroupInputSchema } from '@family-recipe/shared';

export const groupRouter = Router();

groupRouter.get('/', async (req, res) => {
  try {
    const query = String(req.query.search || '').trim();

    const where: Record<string, unknown> = {};
    if (query) {
      where['name'] = { contains: query, mode: 'insensitive' };
    }

    const groups = await prisma.group.findMany({
      where,
      orderBy: { lastUpdated: 'desc' },
    });

    return res.status(200).json({ groups });
  } catch (error) {
    console.error('List groups error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

groupRouter.get('/:id', async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        recipes: {
          include: {
            recipe: {
              include: { ingredients: true },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'group_not_found' });
    }

    const recipes = group.recipes.map((rg: { recipe: Record<string, unknown> }) => rg.recipe);
    const isOwner = group.ownerId === req.userId;

    return res.status(200).json({ group, recipes, isOwner });
  } catch (error) {
    console.error('Get group error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

groupRouter.post('/', async (req, res) => {
  try {
    const parsed = createGroupInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { name, description, icon } = parsed.data;

    const group = await prisma.group.create({
      data: {
        name,
        description,
        icon: icon ?? '',
        ownerId: req.userId!,
        lastUpdated: new Date(),
        members: {
          create: {
            userId: req.userId!,
          },
        },
      },
    });

    return res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

groupRouter.patch('/:id', async (req, res) => {
  try {
    const existing = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'group_not_found' });
    }

    const parsed = updateGroupInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { name, description, icon } = parsed.data;

    const group = await prisma.group.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(icon != null && { icon }),
        lastUpdated: new Date(),
      },
    });

    return res.status(200).json(group);
  } catch (error) {
    console.error('Update group error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

groupRouter.post('/:id/recipes', async (req, res) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ error: 'recipe_id_required' });
    }

    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) {
      return res.status(404).json({ error: 'group_not_found' });
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return res.status(404).json({ error: 'recipe_not_found' });
    }

    await prisma.recipeGroup.upsert({
      where: {
        recipeId_groupId: {
          recipeId,
          groupId: req.params.id,
        },
      },
      create: {
        recipeId,
        groupId: req.params.id,
      },
      update: {},
    });

    return res.status(200).json({ group, recipe });
  } catch (error) {
    console.error('Add recipe to group error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});
