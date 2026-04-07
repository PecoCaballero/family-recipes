import { Router } from 'express';
import { currentUserId, getUser, users } from '../data';

export const usersRouter = Router();

usersRouter.get('/me', (_req, res) => {
  const user = getUser();
  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }

  return res.status(200).json(user);
});

usersRouter.patch('/me/settings', (req, res) => {
  const user = getUser();
  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }

  const { language, privacyLevel, notifications, theme } = req.body;
  user.settings = {
    language: language ?? user.settings.language,
    privacyLevel: privacyLevel ?? user.settings.privacyLevel,
    notifications: notifications ?? user.settings.notifications,
    theme: theme ?? user.settings.theme,
  };
  user.updatedAt = new Date().toISOString();

  return res.status(200).json(user);
});

usersRouter.post('/me/logout', (_req, res) => {
  return res.status(200).json({ status: 'success' });
});
