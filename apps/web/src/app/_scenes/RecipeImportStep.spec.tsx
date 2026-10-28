import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { RecipeImportDraft } from '@family-recipe/shared';
import { RecipeImportStep } from './RecipeImportStep';
import { useImportRecipe } from '../_hooks/recipes';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../_hooks/recipes', () => ({ useImportRecipe: jest.fn() }));

const useImportRecipeMock = useImportRecipe as jest.Mock;

const draft: RecipeImportDraft = {
  name: 'Pancakes',
  description: 'Fluffy',
  ingredients: [{ name: 'Flour', quantity: '2', unit: 'cups' }],
  instructions: 'Mix and fry',
};

describe('RecipeImportStep', () => {
  beforeEach(() => {
    useImportRecipeMock.mockReset();
    useImportRecipeMock.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
  });

  it('parses pasted text and hands the draft up', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(draft);
    useImportRecipeMock.mockReturnValue({ mutateAsync, isPending: false });
    const onDraft = jest.fn();

    render(<RecipeImportStep onDraft={onDraft} />);

    fireEvent.change(screen.getByLabelText('recipes.importRecipe'), {
      target: { value: 'flour, eggs, milk' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'recipes.importParse' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith('flour, eggs, milk'));
    await waitFor(() => expect(onDraft).toHaveBeenCalledWith(draft));
  });

  it('shows an error when parsing fails', async () => {
    const mutateAsync = jest.fn().mockRejectedValue({
      response: { data: { error: 'import_unparseable' } },
    });
    useImportRecipeMock.mockReturnValue({ mutateAsync, isPending: false });
    const onDraft = jest.fn();

    render(<RecipeImportStep onDraft={onDraft} />);

    fireEvent.change(screen.getByLabelText('recipes.importRecipe'), {
      target: { value: 'not a recipe' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'recipes.importParse' }));

    expect(await screen.findByText('recipes.importUnparseable')).toBeInTheDocument();
    expect(onDraft).not.toHaveBeenCalled();
  });
});
