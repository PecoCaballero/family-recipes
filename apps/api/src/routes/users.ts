import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

usersRouter.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      settings: {
        language: user.language,
        privacyLevel: user.privacyLevel,
        notifications: user.notifications,
        theme: user.theme,
      },
      recipesSaved: [],
      recipesSharedByOthers: 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

usersRouter.patch('/me/settings', async (req, res) => {
  try {
    const { language, privacyLevel, notifications, theme } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(language !== undefined && { language }),
        ...(privacyLevel !== undefined && { privacyLevel }),
        ...(notifications !== undefined && { notifications }),
        ...(theme !== undefined && { theme }),
      },
    });

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      settings: {
        language: user.language,
        privacyLevel: user.privacyLevel,
        notifications: user.notifications,
        theme: user.theme,
      },
      recipesSaved: [],
      recipesSharedByOthers: 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

usersRouter.post('/me/logout', async (req, res) => {
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
