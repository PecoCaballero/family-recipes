import { extensionForMimeType } from './avatarUpload';

describe('extensionForMimeType', () => {
  it('maps known image MIME types to safe extensions', () => {
    expect(extensionForMimeType('image/jpeg')).toBe('jpg');
    expect(extensionForMimeType('image/png')).toBe('png');
    expect(extensionForMimeType('image/webp')).toBe('webp');
    expect(extensionForMimeType('image/gif')).toBe('gif');
  });

  it('defaults unknown image MIME types to png', () => {
    expect(extensionForMimeType('image/svg+xml')).toBe('png');
  });

  it('never returns a path separator or dot segment', () => {
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
      const ext = extensionForMimeType(mime);
      expect(ext).toMatch(/^[a-z]+$/);
      expect(ext).not.toContain('/');
      expect(ext).not.toContain('..');
    }
  });
});
