import { shouldUseTls } from './dbConfig';

describe('shouldUseTls', () => {
  it('returns true when sslmode=require', () => {
    expect(shouldUseTls('postgresql://user:pass@host:5432/db?sslmode=require')).toBe(true);
  });

  it('returns false when no sslmode is present', () => {
    expect(shouldUseTls('postgresql://user:pass@host:5432/db')).toBe(false);
  });

  it('returns false when sslmode=disable', () => {
    expect(shouldUseTls('postgresql://user:pass@host:5432/db?sslmode=disable')).toBe(false);
  });

  it('returns false for an unparsable url', () => {
    expect(shouldUseTls('not-a-url')).toBe(false);
  });
});
