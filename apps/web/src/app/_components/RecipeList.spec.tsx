import { render, screen } from '@testing-library/react';
import type { Recipe } from '@family-recipe/shared';
import { RecipeList } from './RecipeList';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

function makeRecipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: 'r1',
    authorId: 'u1',
    author: 'Alice',
    name: 'Pancakes',
    description: 'Fluffy',
    ingredients: [],
    instructions: 'Mix',
    lastUpdated: '2026-01-01T00:00:00.000Z',
    groupIds: [],
    savedByIds: [],
    ...overrides,
  } as Recipe;
}

describe('RecipeList', () => {
  it('renders each recipe name and description', () => {
    render(
      <RecipeList
        recipes={[
          makeRecipe({ id: 'r1', name: 'Pancakes', description: 'Fluffy' }),
          makeRecipe({ id: 'r2', name: 'Tacos', description: 'Spicy' }),
        ]}
      />,
    );

    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('Tacos')).toBeInTheDocument();
    expect(screen.getByText('Fluffy')).toBeInTheDocument();
  });

  it('shows the author on every recipe card', () => {
    render(
      <RecipeList
        recipes={[
          makeRecipe({ id: 'r1', author: 'Alice' }),
          makeRecipe({ id: 'r2', author: 'Bob' }),
        ]}
      />,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
