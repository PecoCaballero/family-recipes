import express from 'express';
import request from 'supertest';
import { prisma } from '../lib/prisma';
import { normalizeName, isCovered, scoreRecipeCoverage, pantryRouter } from './pantry';

jest.mock('../lib/prisma', () => ({
  prisma: {
    pantryItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    groupMember: {
      findMany: jest.fn(),
    },
    recipe: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('./recipes', () => ({
  formatRecipe: jest.fn(async (raw: { id: string; name: string }) => ({
    id: raw.id,
    name: raw.name,
  })),
}));

const pantryItem = prisma.pantryItem as unknown as {
  findMany: jest.Mock;
  create: jest.Mock;
  deleteMany: jest.Mock;
};
const groupMember = prisma.groupMember as unknown as { findMany: jest.Mock };
const recipe = prisma.recipe as unknown as { findMany: jest.Mock };

function makeApp(userId = 'user-1') {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.userId = userId;
    next();
  });
  app.use('/pantry', pantryRouter);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
  pantryItem.findMany.mockResolvedValue([]);
  pantryItem.create.mockResolvedValue({ id: 'p1', name: 'onion' });
  pantryItem.deleteMany.mockResolvedValue({ count: 0 });
  groupMember.findMany.mockResolvedValue([]);
  recipe.findMany.mockResolvedValue([]);
});

describe('pantry name matching', () => {
  it('normalizes by trimming and lowercasing', () => {
    expect(normalizeName('  Onion  ')).toBe('onion');
  });

  it('covers equal names ignoring case', () => {
    expect(isCovered(['Onion'], 'ONION')).toBe(true);
  });

  it('does not cover substring or partial matches', () => {
    expect(isCovered(['egg'], 'eggplant')).toBe(false);
    expect(isCovered(['milk'], 'chocolate milk')).toBe(false);
    expect(isCovered(['tomato'], 'tomatoes')).toBe(false);
  });

  it('does not cover unrelated names', () => {
    expect(isCovered(['onion'], 'garlic')).toBe(false);
  });

  it('scores fully covered recipes as canMake', () => {
    const score = scoreRecipeCoverage([{ name: 'onion' }, { name: 'garlic' }], ['onion', 'garlic']);
    expect(score).toEqual({ status: 'canMake', missingCount: 0, missingIngredients: [] });
  });

  it('scores a recipe with one missing ingredient as almost', () => {
    const score = scoreRecipeCoverage([{ name: 'onion' }, { name: 'garlic' }], ['onion']);
    expect(score).toEqual({ status: 'almost', missingCount: 1, missingIngredients: ['garlic'] });
  });
});

describe('pantry CRUD', () => {
  it('lists the user pantry items', async () => {
    pantryItem.findMany.mockResolvedValue([
      { id: 'p1', name: 'onion', createdAt: new Date(), updatedAt: new Date() },
    ]);

    const res = await request(makeApp()).get('/pantry');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [{ id: 'p1', name: 'onion' }] });
  });

  it('adds a new ingredient and returns 201', async () => {
    pantryItem.create.mockResolvedValue({ id: 'p2', name: 'tomato' });

    const res = await request(makeApp()).post('/pantry').send({ name: 'tomato' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'p2', name: 'tomato' });
  });

  it('rejects a duplicate ingredient with 409', async () => {
    pantryItem.findMany.mockResolvedValue([
      { id: 'p1', name: 'Onion', createdAt: new Date(), updatedAt: new Date() },
    ]);

    const res = await request(makeApp()).post('/pantry').send({ name: 'onion' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'pantry_item_exists' });
    expect(pantryItem.create).not.toHaveBeenCalled();
  });

  it('rejects a blank ingredient name with 400', async () => {
    const res = await request(makeApp()).post('/pantry').send({ name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  it('removes an owned item and returns 204', async () => {
    pantryItem.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(makeApp()).delete('/pantry/p1');

    expect(res.status).toBe(204);
    expect(pantryItem.deleteMany).toHaveBeenCalledWith({
      where: { id: 'p1', userId: 'user-1' },
    });
  });

  it('returns 404 when removing a non-existent item', async () => {
    const res = await request(makeApp()).delete('/pantry/missing');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'pantry_item_not_found' });
  });
});

describe('pantry suggestions', () => {
  const baseRecipe = (id: string, names: string[], lastUpdated: Date) => ({
    id,
    name: id,
    lastUpdated,
    ingredients: names.map((name) => ({ name })),
  });

  it('returns an empty list for an empty pantry', async () => {
    const res = await request(makeApp()).get('/pantry/suggest');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ suggestions: [] });
  });

  it('scores and sorts suggestions best-first, omitting recipes missing 3+', async () => {
    pantryItem.findMany.mockResolvedValue([
      { id: 'p1', name: 'onion', createdAt: new Date(), updatedAt: new Date() },
    ]);
    recipe.findMany.mockResolvedValue([
      baseRecipe('almost2', ['onion', 'garlic', 'salt'], new Date('2026-01-02')),
      baseRecipe('omitted', ['onion', 'garlic', 'salt', 'pepper'], new Date('2026-01-04')),
      baseRecipe('canMake', ['onion'], new Date('2026-01-01')),
      baseRecipe('almost1', ['onion', 'garlic'], new Date('2026-01-03')),
    ]);

    const res = await request(makeApp()).get('/pantry/suggest');

    expect(res.status).toBe(200);
    expect(res.body.suggestions.map((s: { recipe: { id: string } }) => s.recipe.id)).toEqual([
      'canMake',
      'almost1',
      'almost2',
    ]);
    expect(res.body.suggestions[0]).toMatchObject({
      status: 'canMake',
      missingCount: 0,
      missingIngredients: [],
    });
    expect(res.body.suggestions[1]).toMatchObject({
      status: 'almost',
      missingCount: 1,
      missingIngredients: ['garlic'],
    });
  });

  it('filters suggestions to recipes visible to the user', async () => {
    pantryItem.findMany.mockResolvedValue([
      { id: 'p1', name: 'onion', createdAt: new Date(), updatedAt: new Date() },
    ]);
    recipe.findMany.mockResolvedValue([baseRecipe('r1', ['onion'], new Date())]);

    await request(makeApp()).get('/pantry/suggest');

    const where = recipe.findMany.mock.calls[0][0].where as { OR: unknown[] };
    expect(where.OR).toContainEqual({ authorId: 'user-1' });
    expect(where.OR).toContainEqual({ visibility: 'public' });
  });

  it('includes group membership in visibility when the user has groups', async () => {
    pantryItem.findMany.mockResolvedValue([
      { id: 'p1', name: 'onion', createdAt: new Date(), updatedAt: new Date() },
    ]);
    groupMember.findMany.mockResolvedValue([{ groupId: 'g1' }]);
    recipe.findMany.mockResolvedValue([baseRecipe('r1', ['onion'], new Date())]);

    await request(makeApp()).get('/pantry/suggest');

    const where = recipe.findMany.mock.calls[0][0].where as { OR: unknown[] };
    expect(where.OR).toContainEqual({
      recipeGroups: { some: { groupId: { in: ['g1'] } } },
    });
  });
});
