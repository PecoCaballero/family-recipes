import { prisma } from './prisma';
import { canViewRecipe } from './recipeAccess';

jest.mock('./prisma', () => ({
  prisma: {
    recipe: {
      findFirst: jest.fn(),
    },
  },
}));

const recipe = prisma.recipe as unknown as { findFirst: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('canViewRecipe', () => {
  it('returns true when the user is the author', async () => {
    recipe.findFirst.mockResolvedValue({ id: 'r1' });
    await expect(canViewRecipe('u1', 'r1')).resolves.toBe(true);
    expect(recipe.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'r1',
          OR: expect.arrayContaining([{ authorId: 'u1' }, { visibility: 'public' }]),
        }),
      }),
    );
  });

  it('returns false when the recipe is invisible or missing', async () => {
    recipe.findFirst.mockResolvedValue(null);
    await expect(canViewRecipe('u1', 'missing')).resolves.toBe(false);
  });
});
