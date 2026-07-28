import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production';
const ACCESS_EXPIRES_IN_SECONDS = 900; // 15 minutes
const REFRESH_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN_SECONDS });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function verifyAccessToken(token: string): { sub: string } {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_EXPIRES_IN_MS);
}
