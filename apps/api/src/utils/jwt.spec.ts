import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashToken,
  resolveJwtSecret,
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

  it('hashes refresh tokens to a deterministic sha256 hex', () => {
    const hash = hashToken('abc');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(hashToken('abc')).toBe(hash);
  });
});

describe('resolveJwtSecret', () => {
  it('throws in production when the secret is unset', () => {
    expect(() => resolveJwtSecret({}, 'production')).toThrow(/JWT_SECRET/);
  });

  it('throws in production when the secret is a placeholder', () => {
    expect(() =>
      resolveJwtSecret({ JWT_SECRET: 'dev-secret-change-in-production' }, 'production'),
    ).toThrow(/JWT_SECRET/);
  });

  it('returns the configured secret in production', () => {
    expect(resolveJwtSecret({ JWT_SECRET: 'a-strong-secret' }, 'production')).toBe(
      'a-strong-secret',
    );
  });

  it('falls back to the dev secret outside production', () => {
    expect(resolveJwtSecret({}, 'development')).toBe('dev-secret-change-in-production');
    expect(resolveJwtSecret({}, 'test')).toBe('dev-secret-change-in-production');
  });
});
