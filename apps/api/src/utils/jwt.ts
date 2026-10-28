import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const DEV_SECRET = 'dev-secret-change-in-production';
const PLACEHOLDER_SECRETS = new Set(['', DEV_SECRET, 'change-me-to-a-random-secret-in-production']);
const ACCESS_EXPIRES_IN_SECONDS = 900; // 15 minutes
const REFRESH_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Resolves the JWT secret for a given environment. In production it throws on
 * a missing or placeholder secret instead of silently falling back to a known
 * dev value. Exposed for unit testing; `JWT_SECRET` below calls it at import.
 */
export function resolveJwtSecret(env: NodeJS.ProcessEnv, nodeEnv: string | undefined): string {
  const secret = env['JWT_SECRET'];
  if (nodeEnv === 'production' && (!secret || PLACEHOLDER_SECRETS.has(secret))) {
    throw new Error(
      'JWT_SECRET is unset or a placeholder. Set a strong secret before deploying to production.',
    );
  }
  return secret && secret.trim() !== '' ? secret : DEV_SECRET;
}

function resolveSecret(): string {
  return resolveJwtSecret(process.env, process.env.NODE_ENV);
}

const JWT_SECRET = resolveSecret();

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN_SECONDS });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

/** SHA-256 hex digest; used so refresh tokens are never stored in plaintext. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): { sub: string } {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_EXPIRES_IN_MS);
}
