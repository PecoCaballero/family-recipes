import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from './jwt';

describe('jwt utils', () => {
  it('round-trips a userId through sign/verify', () => {
    const token = generateAccessToken('user-123');
    expect(typeof token).toBe('string');
    expect(verifyAccessToken(token).sub).toBe('user-123');
  });

  it('rejects a tampered/invalid token', () => {
    expect(() => verifyAccessToken('not-a-real-token')).toThrow();
  });

  it('generates unique hex refresh tokens', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).toMatch(/^[0-9a-f]{96}$/);
    expect(a).not.toBe(b);
  });

  it('returns a refresh expiry in the future', () => {
    expect(getRefreshTokenExpiry().getTime()).toBeGreaterThan(Date.now());
  });
});
