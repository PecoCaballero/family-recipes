import express from 'express';
import request from 'supertest';
import { prisma } from '../lib/prisma';
import { canViewRecipe } from '../lib/recipeAccess';
import { recipeRouter } from './recipes';

jest.mock('../lib/prisma', () => ({
  prisma: {
    recipe: { findUnique: jest.fn(), findMany: jest.fn() },
    savedRecipe: { count: jest.fn() },
    recipeGroup: { findMany: jest.fn(), upsert: jest.fn() },
    group: { findUnique: jest.fn() },
    groupMember: { findUnique: jest.fn() },
  },
}));

jest.mock('../lib/recipeAccess', () => ({
  canViewRecipe: jest.fn(),
}));

const recipe = prisma.recipe as unknown as { findUnique: jest.Mock };
const group = prisma.group as unknown as { findUnique: jest.Mock };
const groupMember = prisma.groupMember as unknown as { findUnique: jest.Mock };
const recipeGroup = prisma.recipeGroup as unknown as { upsert: jest.Mock };
const canView = canViewRecipe as jest.Mock;

function makeApp(userId = 'user-1') {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.userId = userId;
    next();
  });
  app.use('/recipes', recipeRouter);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /recipes/:id visibility', () => {
  it('returns 404 for a recipe the user cannot view', async () => {
    recipe.findUnique.mockResolvedValue({ id: 'r1', authorId: 'other', visibility: 'private' });
    canView.mockResolvedValue(false);

    const res = await request(makeApp()).get('/recipes/r1');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'recipe_not_found' });
  });

  it('returns 404 for a missing recipe', async () => {
    recipe.findUnique.mockResolvedValue(null);

    const res = await request(makeApp()).get('/recipes/missing');

    expect(res.status).toBe(404);
    expect(canView).not.toHaveBeenCalled();
  });
});

describe('POST /recipes/:id/groups', () => {
  it('returns 404 when the recipe is not visible to the caller', async () => {
    recipe.findUnique.mockResolvedValue({ id: 'r1' });
    canView.mockResolvedValue(false);

    const res = await request(makeApp()).post('/recipes/r1/groups').send({ groupId: 'g1' });

    expect(res.status).toBe(404);
    expect(recipeGroup.upsert).not.toHaveBeenCalled();
  });

  it('returns 403 when the caller is not a group member', async () => {
    recipe.findUnique.mockResolvedValue({ id: 'r1' });
    canView.mockResolvedValue(true);
    group.findUnique.mockResolvedValue({ id: 'g1' });
    groupMember.findUnique.mockResolvedValue(null);

    const res = await request(makeApp()).post('/recipes/r1/groups').send({ groupId: 'g1' });

    expect(res.status).toBe(403);
    expect(recipeGroup.upsert).not.toHaveBeenCalled();
  });
});
