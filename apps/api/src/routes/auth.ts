import { Router } from 'express';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import {
  userSettingsSchema,
  loginInputSchema,
  registerInputSchema,
  googleAuthInputSchema,
} from '@family-recipe/shared';
import type { AuthResponse } from '@family-recipe/shared';

export const authRouter = Router();

const SALT_ROUNDS = 12;
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'] ?? '';

authRouter.post('/login', async (req, res) => {
  try {
    const parsed = loginInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        settings: userSettingsSchema.parse({
          language: user.language,
          privacyLevel: user.privacyLevel,
          notifications: user.notifications,
          theme: user.theme,
        }),
        recipesSaved: [],
        recipesSharedByOthers: 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

authRouter.post('/register', async (req, res) => {
  try {
    const parsed = registerInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'email_already_exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        settings: userSettingsSchema.parse({
          language: user.language,
          privacyLevel: user.privacyLevel,
          notifications: user.notifications,
          theme: user.theme,
        }),
        recipesSaved: [],
        recipesSharedByOthers: 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ error: 'validation_error', details: ['refreshToken is required'] });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return res.status(401).json({ error: 'token_expired' });
    }

    // Rotate: delete old token, create new pair
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = generateAccessToken(storedToken.userId);
    const newRefreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt,
      },
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

authRouter.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId: req.userId },
      });
    }
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

authRouter.post('/google', async (req, res) => {
  try {
    const parsed = googleAuthInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { idToken } = parsed.data;

    let payload;
    try {
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ error: 'invalid_google_token' });
    }

    if (!payload?.sub || !payload?.email || !payload?.email_verified) {
      return res.status(401).json({ error: 'invalid_google_token' });
    }

    const email = payload.email;
    const sub = payload.sub;
    const name = payload.name ?? email.split('@')[0];
    const avatar = payload.picture ?? null;

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.provider !== 'google' || user.providerId !== sub) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { provider: 'google', providerId: sub },
        });
      }
    } else {
      user = await prisma.user.create({
        data: { name, email, provider: 'google', providerId: sub, avatar },
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        settings: userSettingsSchema.parse({
          language: user.language,
          privacyLevel: user.privacyLevel,
          notifications: user.notifications,
          theme: user.theme,
        }),
        recipesSaved: [],
        recipesSharedByOthers: 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});
