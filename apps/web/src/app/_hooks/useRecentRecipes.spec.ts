import { readRecentRecipes, recordRecentRecipe } from './useRecentRecipes';

describe('useRecentRecipes storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty list when there is no history', () => {
    expect(readRecentRecipes()).toEqual([]);
  });

  it('records and de-duplicates recently viewed recipes', () => {
    recordRecentRecipe({ id: 'r1', name: 'Pancakes' });
    recordRecentRecipe({ id: 'r2', name: 'Tacos' });
    recordRecentRecipe({ id: 'r1', name: 'Pancakes' });

    expect(readRecentRecipes().map((r) => r.id)).toEqual(['r1', 'r2']);
  });

  it('caps the history length', () => {
    for (let i = 0; i < 15; i += 1) {
      recordRecentRecipe({ id: `r${i}`, name: `Recipe ${i}` });
    }

    expect(readRecentRecipes()).toHaveLength(10);
  });
});
