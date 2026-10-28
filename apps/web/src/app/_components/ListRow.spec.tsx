import { render, screen, fireEvent } from '@testing-library/react';
import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('renders title, subtitle and leading/trailing slots', () => {
    render(
      <ListRow
        leading={<span data-testid="lead" />}
        title="Sunday Dinner Club"
        subtitle="3 recipes"
        trailing={<span>Jan 1</span>}
      />,
    );

    expect(screen.getByText('Sunday Dinner Club')).toBeInTheDocument();
    expect(screen.getByText('3 recipes')).toBeInTheDocument();
    expect(screen.getByText('Jan 1')).toBeInTheDocument();
    expect(screen.getByTestId('lead')).toBeInTheDocument();
  });

  it('is fully tappable', () => {
    const onClick = jest.fn();
    render(<ListRow title="Baking Enthusiasts" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
