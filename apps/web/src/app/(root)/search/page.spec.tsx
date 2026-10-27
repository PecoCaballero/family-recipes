import { render, screen, fireEvent } from '@testing-library/react';
import type { Recipe } from '@family-recipe/shared';
import SearchPage from './page';
import {
  usePantryQuery,
  useAddPantryItem,
  useRemovePantryItem,
  usePantrySuggestionsQuery,
} from '@/app/_hooks/pantry';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next/link', () => ({ __esModule: true, default: () => null }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/app/_hooks/useSearch', () => ({
  useSearch: () => ({ searchQuery: '', handleSearchChange: jest.fn() }),
}));
jest.mock('@/app/_hooks/useRecentRecipes', () => ({
  useRecentRecipes: () => [],
}));
jest.mock('@/app/_hooks/recipes', () => ({
  useRecipesQuery: () => ({ data: [], isLoading: false }),
}));
jest.mock('@/app/_hooks/pantry', () => ({
  usePantryQuery: jest.fn(),
  useAddPantryItem: jest.fn(),
  useRemovePantryItem: jest.fn(),
  usePantrySuggestionsQuery: jest.fn(),
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

const mockAdd = jest.fn();
const mockRemove = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (usePantryQuery as jest.Mock).mockReturnValue({
    data: [{ id: 'p1', name: 'Onion' }],
    isLoading: false,
  });
  (useAddPantryItem as jest.Mock).mockReturnValue({ mutate: mockAdd, isPending: false });
  (useRemovePantryItem as jest.Mock).mockReturnValue({ mutate: mockRemove });
  (usePantrySuggestionsQuery as jest.Mock).mockReturnValue({
    data: [
      {
        recipe: makeRecipe({ id: 'r1', name: 'Pancakes' }),
        status: 'canMake',
        missingCount: 0,
        missingIngredients: [],
      },
      {
        recipe: makeRecipe({ id: 'r2', name: 'Tacos' }),
        status: 'almost',
        missingCount: 1,
        missingIngredients: ['Cheese'],
      },
    ],
    isLoading: false,
    refetch: jest.fn(),
  });
});

describe('SearchPage pantry mode', () => {
  it('shows pantry items and grouped suggestions', () => {
    render(<SearchPage />);

    fireEvent.click(screen.getByRole('button', { name: 'pantry.title' }));

    expect(screen.getByText('Onion')).toBeInTheDocument();
    expect(screen.getByText('pantry.youCanMake')).toBeInTheDocument();
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('pantry.almostThere')).toBeInTheDocument();
    expect(screen.getByText('Tacos')).toBeInTheDocument();
  });

  it('adds an ingredient via the add mutation', () => {
    render(<SearchPage />);

    fireEvent.click(screen.getByRole('button', { name: 'pantry.title' }));
    fireEvent.change(screen.getByPlaceholderText('pantry.addPlaceholder'), {
      target: { value: 'Garlic' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'pantry.add' }));

    expect(mockAdd).toHaveBeenCalledWith(
      'Garlic',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('removes an ingredient via the remove mutation', () => {
    render(<SearchPage />);

    fireEvent.click(screen.getByRole('button', { name: 'pantry.title' }));
    fireEvent.click(screen.getByRole('button', { name: 'pantry.remove' }));

    expect(mockRemove).toHaveBeenCalledWith('p1');
  });
});
