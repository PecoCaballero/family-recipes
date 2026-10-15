import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from './theme';
import { brand, MIN_TOUCH_TARGET } from './tokens';
import { FloatingActionButton } from '../_components/FloatingActionButton';

function buttonRoot(theme: ReturnType<typeof getTheme>): { minHeight?: number } | undefined {
  const overrides = theme.components?.MuiButton?.styleOverrides as
    | Record<string, { minHeight?: number }>
    | undefined;
  return overrides?.root;
}

describe('design system theme', () => {
  it('uses the WhatsApp green palette instead of the MUI default blue', () => {
    const light = getTheme('light');
    const dark = getTheme('dark');

    expect(light.palette.primary.main).toBe(brand.greenDark);
    expect(dark.palette.primary.main).toBe(brand.green);
    expect([light.palette.primary.main, dark.palette.primary.main]).not.toContain('#1976d2');
  });

  it('enforces the minimum touch target on buttons', () => {
    const theme = getTheme('light');

    expect(buttonRoot(theme)?.minHeight).toBe(MIN_TOUCH_TARGET);
    expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(48);
  });

  it('renders a shared component with the brand primary color', () => {
    render(
      <ThemeProvider theme={getTheme('light')}>
        <FloatingActionButton icon={<span />} label="Create" onClick={() => {}} />
      </ThemeProvider>,
    );

    const button = screen.getByLabelText('Create');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('MuiFab-primary');
  });
});
