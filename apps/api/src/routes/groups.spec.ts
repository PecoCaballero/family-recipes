import express from 'express';
import request from 'supertest';
import { prisma } from '../lib/prisma';
import { canViewRecipe } from '../lib/recipeAccess';
import { groupRouter } from './groups';

jest.mock('../lib/prisma', () => ({
  prisma: {
    group: { findUnique: jest.fn(), findMany: jest.fn() },
    groupAdmin: { findUnique: jest.fn() },
    groupMember: { findMany: jest.fn() },
    recipe: { findUnique: jest.fn(), findMany: jest.fn() },
    recipeGroup: { findMany: jest.fn(), upsert: jest.fn() },
    invitation: { findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('../lib/recipeAccess', () => ({
  canViewRecipe: jest.fn(),
}));

const groupAdmin = prisma.groupAdmin as unknown as { findUnique: jest.Mock };
const group = prisma.group as unknown as { findUnique: jest.Mock };
const recipe = prisma.recipe as unknown as { findUnique: jest.Mock; findMany: jest.Mock };
const recipeGroup = prisma.recipeGroup as unknown as { findMany: jest.Mock; upsert: jest.Mock };
const tx = prisma.$transaction as jest.Mock;
const canView = canViewRecipe as jest.Mock;

function makeApp(userId = 'admin-1') {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.userId = userId;
    next();
  });
  app.use('/groups', groupRouter);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
  groupAdmin.findUnique.mockResolvedValue({ groupId: 'g1', userId: 'admin-1' });
});

describe('POST /groups/:id/recipes', () => {
  it('returns 404 when the admin cannot view the recipe', async () => {
    recipe.findUnique.mockResolvedValue({ id: 'r1', authorId: 'other', visibility: 'private' });
    canView.mockResolvedValue(false);

    const res = await request(makeApp()).post('/groups/g1/recipes').send({ recipeId: 'r1' });

    expect(res.status).toBe(404);
    expect(recipeGroup.upsert).not.toHaveBeenCalled();
  });
});

describe('POST /groups/:id/recipes/batch', () => {
  const id = '11111111-1111-4111-8111-111111111111';

  it('returns 404 when any requested recipe is invisible', async () => {
    group.findUnique.mockResolvedValue({ id: 'g1' });
    recipe.findMany.mockResolvedValue([]); // none of the requested ids are visible

    const res = await request(makeApp())
      .post('/groups/g1/recipes/batch')
      .send({ recipeIds: [id] });

    expect(res.status).toBe(404);
    expect(recipeGroup.findMany).not.toHaveBeenCalled();
    expect(tx).not.toHaveBeenCalled();
  });

  it('proceeds when every requested recipe is visible', async () => {
    group.findUnique.mockResolvedValue({ id: 'g1' });
    recipe.findMany.mockResolvedValue([{ id }]);
    recipeGroup.findMany.mockResolvedValue([]);
    tx.mockResolvedValue([]);

    const res = await request(makeApp())
      .post('/groups/g1/recipes/batch')
      .send({ recipeIds: [id] });

    expect(res.status).toBe(200);
    expect(tx).toHaveBeenCalled();
  });
});
