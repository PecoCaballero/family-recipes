import type { Recipe } from '@family-recipe/shared';
import { filterOwnAndSaved, filterRecipesByQuery } from './recipeFilters';

function recipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: 'r',
    authorId: 'u1',
    author: 'Alice',
    name: 'Recipe',
    description: '',
    ingredients: [],
    instructions: '',
    lastUpdated: '2026-01-01T00:00:00.000Z',
    groupIds: [],
    savedByIds: [],
    ...overrides,
  } as Recipe;
}

describe('filterOwnAndSaved', () => {
  it('keeps only authored or saved recipes', () => {
    const recipes = [
      recipe({ id: 'own', isAuthor: true }),
      recipe({ id: 'saved', isSaved: true }),
      recipe({ id: 'public', isAuthor: false, isSaved: false }),
    ];

    expect(filterOwnAndSaved(recipes).map((r) => r.id)).toEqual(['own', 'saved']);
  });
});

describe('filterRecipesByQuery', () => {
  const recipes = [
    recipe({ id: 'a', name: 'Pancakes', description: 'Fluffy breakfast' }),
    recipe({ id: 'b', name: 'Tacos', description: 'Spicy dinner' }),
  ];

  it('matches by title, case-insensitively', () => {
    expect(filterRecipesByQuery(recipes, 'pan').map((r) => r.id)).toEqual(['a']);
  });

  it('matches by description', () => {
    expect(filterRecipesByQuery(recipes, 'spicy').map((r) => r.id)).toEqual(['b']);
  });

  it('returns everything for an empty query', () => {
    expect(filterRecipesByQuery(recipes, '   ')).toHaveLength(2);
  });
});
