import {
  ingredientSchema,
  createRecipeInputSchema,
  updateRecipeInputSchema,
  recipeSchema,
  createGroupInputSchema,
  loginInputSchema,
  batchAddRecipesSchema,
  updateProfileSchema,
} from './index';

describe('shared schemas', () => {
  describe('ingredientSchema', () => {
    it('accepts a valid ingredient', () => {
      expect(ingredientSchema.parse({ name: 'Flour', quantity: '2 cups' })).toEqual({
        name: 'Flour',
        quantity: '2 cups',
      });
    });

    it('accepts an optional unit', () => {
      expect(ingredientSchema.parse({ name: 'Milk', unit: 'ml', quantity: '200' }).unit).toBe('ml');
    });

    it('rejects a missing name', () => {
      expect(ingredientSchema.safeParse({ quantity: '1' }).success).toBe(false);
    });
  });

  describe('createRecipeInputSchema', () => {
    const valid = {
      name: 'Pancakes',
      description: 'Fluffy stacks',
      instructions: 'Mix and fry',
      ingredients: [{ name: 'Flour', quantity: '2 cups' }],
    };

    it('accepts a valid payload', () => {
      expect(createRecipeInputSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects an empty name', () => {
      expect(createRecipeInputSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    });

    it('rejects missing instructions', () => {
      const { instructions: _instructions, ...rest } = valid;
      expect(createRecipeInputSchema.safeParse(rest).success).toBe(false);
    });
  });

  describe('recipeSchema nesting', () => {
    const base = {
      id: 'r1',
      authorId: 'u1',
      author: 'Alice',
      name: 'Pancakes',
      description: 'Fluffy',
      ingredients: [],
      instructions: 'Mix',
      lastUpdated: new Date().toISOString(),
      groupIds: [],
      savedByIds: [],
    };

    it('accepts a recipe without nesting', () => {
      expect(recipeSchema.safeParse(base).success).toBe(true);
    });

    it('accepts parent and variation summaries', () => {
      const parsed = recipeSchema.safeParse({
        ...base,
        parentRecipe: { id: 'p1', name: 'Grandma Pancakes' },
        nestedRecipes: [{ id: 'c1', name: 'Buttermilk version' }],
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects a malformed summary', () => {
      expect(recipeSchema.safeParse({ ...base, nestedRecipes: [{ id: 'c1' }] }).success).toBe(
        false,
      );
    });
  });

  describe('recipe metadata', () => {
    const valid = {
      name: 'Pancakes',
      description: 'Fluffy stacks',
      instructions: 'Mix and fry',
      ingredients: [{ name: 'Flour', quantity: '2 cups' }],
    };

    it('accepts a recipe without metadata', () => {
      expect(createRecipeInputSchema.safeParse(valid).success).toBe(true);
    });

    it('accepts valid metadata', () => {
      const parsed = createRecipeInputSchema.safeParse({
        ...valid,
        cuisine: 'American',
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'easy',
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects non-positive times and servings', () => {
      expect(createRecipeInputSchema.safeParse({ ...valid, prepTime: -1 }).success).toBe(false);
      expect(createRecipeInputSchema.safeParse({ ...valid, cookTime: 0 }).success).toBe(false);
      expect(createRecipeInputSchema.safeParse({ ...valid, servings: 2.5 }).success).toBe(false);
    });

    it('rejects an unknown difficulty', () => {
      expect(
        createRecipeInputSchema.safeParse({ ...valid, difficulty: 'impossible' }).success,
      ).toBe(false);
    });

    it('validates metadata on update', () => {
      expect(updateRecipeInputSchema.safeParse({ difficulty: 'hard' }).success).toBe(true);
      expect(updateRecipeInputSchema.safeParse({ difficulty: 'nope' }).success).toBe(false);
    });
  });

  describe('createGroupInputSchema', () => {
    it('accepts an optional null icon', () => {
      expect(
        createGroupInputSchema.safeParse({ name: 'Bakers', description: 'Bread', icon: null })
          .success,
      ).toBe(true);
    });

    it('rejects an empty description', () => {
      expect(createGroupInputSchema.safeParse({ name: 'Bakers', description: '' }).success).toBe(
        false,
      );
    });
  });

  describe('loginInputSchema', () => {
    it('requires an email and 6+ char password', () => {
      expect(loginInputSchema.safeParse({ email: 'a@b.com', password: 'secret' }).success).toBe(
        true,
      );
      expect(loginInputSchema.safeParse({ email: 'nope', password: 'secret' }).success).toBe(false);
      expect(loginInputSchema.safeParse({ email: 'a@b.com', password: '123' }).success).toBe(false);
    });
  });

  describe('batchAddRecipesSchema', () => {
    it('requires 1-50 uuids', () => {
      const uuid = '824645bf-1356-4f7c-b15a-9515d564ae6c';
      expect(batchAddRecipesSchema.safeParse({ recipeIds: [uuid] }).success).toBe(true);
      expect(batchAddRecipesSchema.safeParse({ recipeIds: [] }).success).toBe(false);
      expect(batchAddRecipesSchema.safeParse({ recipeIds: ['not-a-uuid'] }).success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('requires at least one field', () => {
      expect(updateProfileSchema.safeParse({}).success).toBe(false);
      expect(updateProfileSchema.safeParse({ name: 'Alice' }).success).toBe(true);
    });
  });
});
