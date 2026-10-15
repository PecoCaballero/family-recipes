import { render, screen } from '@testing-library/react';
import { SafeAvatar, isHttpUrl } from './SafeAvatar';
import { apiBaseUrl } from '@/app/_utils/api';

describe('SafeAvatar', () => {
  it('renders the fallback when no src is given', () => {
    render(<SafeAvatar fallback="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('resolves relative src against the api base url', () => {
    const { container } = render(<SafeAvatar src="/uploads/avatars/a.png" fallback="A" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe(`${apiBaseUrl}/uploads/avatars/a.png`);
  });
});

describe('isHttpUrl', () => {
  it('detects http(s) urls only', () => {
    expect(isHttpUrl('https://x.test/a.png')).toBe(true);
    expect(isHttpUrl('/uploads/a.png')).toBe(false);
    expect(isHttpUrl(null)).toBe(false);
  });
});
