import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Recipe } from '@family-recipe/shared';
import { RecipeForm } from './RecipeForm';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next/image', () => ({ __esModule: true, default: () => null }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/app/_hooks/recipes', () => ({ useRecipesQuery: () => ({ data: [] }) }));

const recipe: Recipe = {
  id: 'r1',
  authorId: 'u1',
  author: 'Alice',
  name: 'Pancakes',
  description: 'Fluffy',
  ingredients: [{ name: 'Flour', quantity: '2', unit: 'cups' }],
  instructions: 'Mix and fry',
  lastUpdated: '2026-01-01T00:00:00.000Z',
  parentRecipe: { id: 'p1', name: 'Grandma Pancakes' },
  groupIds: [],
  savedByIds: [],
};

describe('RecipeForm nesting', () => {
  it('submits parentRecipeId when editing a variation', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<RecipeForm recipe={recipe} isEditing onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'common.edit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ parentRecipeId: 'p1' });
  });

  it('renders the "Based on" picker', () => {
    render(<RecipeForm recipe={recipe} isEditing onSubmit={jest.fn()} />);
    expect(screen.getByLabelText('recipes.basedOn')).toBeInTheDocument();
  });
});
