import { render, screen } from '@testing-library/react';
import { RecipeNesting } from './RecipeNesting';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('RecipeNesting', () => {
  it('renders nothing without a parent or variations', () => {
    const { container } = render(<RecipeNesting />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a link to the parent recipe', () => {
    render(<RecipeNesting parent={{ id: 'p1', name: 'Grandma Pancakes' }} />);
    const link = screen.getByRole('link', { name: 'Grandma Pancakes' });
    expect(link).toHaveAttribute('href', '/recipes/p1');
  });

  it('renders a variations section listing child recipes', () => {
    render(
      <RecipeNesting
        variations={[
          { id: 'c1', name: 'Buttermilk version' },
          { id: 'c2', name: 'Vegan version' },
        ]}
      />,
    );

    expect(screen.getByText('recipes.variations')).toBeInTheDocument();
    expect(screen.getByText('Buttermilk version')).toBeInTheDocument();
    expect(screen.getByText('Vegan version')).toBeInTheDocument();
  });
});
