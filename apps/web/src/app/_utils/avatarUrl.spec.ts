import { resolveAvatarUrl } from './avatarUrl';
import { apiBaseUrl } from './api';

describe('resolveAvatarUrl', () => {
  it('returns undefined for empty input', () => {
    expect(resolveAvatarUrl()).toBeUndefined();
    expect(resolveAvatarUrl(null)).toBeUndefined();
    expect(resolveAvatarUrl('')).toBeUndefined();
  });

  it('passes through absolute, data, and blob urls', () => {
    expect(resolveAvatarUrl('http://cdn.test/a.png')).toBe('http://cdn.test/a.png');
    expect(resolveAvatarUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(resolveAvatarUrl('blob:http://localhost/xyz')).toBe('blob:http://localhost/xyz');
  });

  it('prefixes relative paths with the api base url', () => {
    expect(resolveAvatarUrl('/uploads/avatars/a.png')).toBe(`${apiBaseUrl}/uploads/avatars/a.png`);
  });
});
