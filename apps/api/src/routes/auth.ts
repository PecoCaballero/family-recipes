import { Router } from 'express';
import { users } from '../data';
import type { AuthResponse } from '@family-recipe/shared';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email_and_password_required' });
  }

  const user = users.find((item) => item.email === email);
  if (!user) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const response: AuthResponse = {
    accessToken: `mock-access-token-${user.id}`,
    refreshToken: `mock-refresh-token-${user.id}`,
    user,
  };

  return res.status(200).json(response);
});

authRouter.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name_email_password_required' });
  }

  const existing = users.find((item) => item.email === email);
  if (existing) {
    return res.status(409).json({ error: 'user_already_exists' });
  }

  const newUser: AuthResponse['user'] = {
    id: `user-${users.length + 1}`,
    name,
    email,
    avatar: undefined,
    settings: {
      language: 'en',
      privacyLevel: 'private',
      notifications: true,
      theme: 'auto',
    },
    recipesSaved: [],
    recipesSharedByOthers: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);

  const response: AuthResponse = {
    accessToken: `mock-access-token-${newUser.id}`,
    refreshToken: `mock-refresh-token-${newUser.id}`,
    user: newUser,
  };

  return res.status(201).json(response);
});

authRouter.post('/oauth/google', (_req, res) => {
  res.status(501).json({ error: 'not_implemented' });
});

authRouter.post('/oauth/apple', (_req, res) => {
  res.status(501).json({ error: 'not_implemented' });
});
