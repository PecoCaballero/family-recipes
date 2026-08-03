import { Router, type RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { updateProfileSchema, changePasswordSchema } from '@family-recipe/shared';
import type { User } from '@family-recipe/shared';
import { LocalStorageProvider } from '../lib/storage';
import { avatarUploadMiddleware } from '../lib/avatarUpload';

export const usersRouter = Router();
const storage = new LocalStorageProvider();
const SALT_ROUNDS = 12;

function userToResponse(user: {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  language: string;
  privacyLevel: string;
  notifications: boolean;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    settings: {
      language: user.language as User['settings']['language'],
      privacyLevel: user.privacyLevel as User['settings']['privacyLevel'],
      notifications: user.notifications,
      theme: user.theme as User['settings']['theme'],
    },
    recipesSaved: [],
    recipesSharedByOthers: 0,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

usersRouter.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    return res.status(200).json(userToResponse(user));
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

    return res.status(200).json(userToResponse(user));
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

usersRouter.patch('/me', async (req, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { name, email } = parsed.data;

    if (email !== undefined) {
      const currentUser = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!currentUser) return res.status(404).json({ error: 'user_not_found' });

      if (email !== currentUser.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return res.status(409).json({ error: 'email_already_exists' });
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
    });

    return res.status(200).json(userToResponse(user));
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

usersRouter.post('/me/password', async (req, res) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'invalid_current_password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash },
    });

    return res.status(200).json({ status: 'password_updated' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
usersRouter.post('/me/avatar', avatarUploadMiddleware as any, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'validation_error', detail: 'No file uploaded' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    // Delete old avatar file if exists
    if (user.avatar) {
      await storage.delete(user.avatar);
    }

    const ext = req.file.originalname.split('.').pop() ?? 'png';
    const timestamp = Date.now();
    const filename = `${req.userId}_${timestamp}.${ext}`;

    const avatarUrl = await storage.save(filename, req.file.buffer, req.file.mimetype);

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarUrl },
    });

    return res.status(200).json({ avatarUrl });
  } catch (error: any) {
    if (error?.message?.includes('Only image files')) {
      return res.status(400).json({ error: 'invalid_file_type', detail: error.message });
    }
    if (error?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'file_too_large', detail: 'Maximum file size is 5 MB' });
    }
    console.error('Avatar upload error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

usersRouter.delete('/me/avatar', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    if (user.avatar) {
      await storage.delete(user.avatar);
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: null },
    });

    return res.status(200).json({ avatarUrl: null });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

usersRouter.delete('/me', async (req, res) => {
  try {
    // Guard: check if user owns any groups
    const ownedGroups = await prisma.group.findMany({
      where: { ownerId: req.userId },
      select: { id: true, name: true },
    });

    if (ownedGroups.length > 0) {
      return res.status(409).json({
        error: 'group_owner',
        detail: `You own ${ownedGroups.length} group(s). Transfer ownership or delete them before deleting your account.`,
        groups: ownedGroups,
      });
    }

    // Delete avatar file
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { avatar: true },
    });
    if (user?.avatar) {
      await storage.delete(user.avatar);
    }

    // Cascade delete in transaction
    await prisma.$transaction(async (tx) => {
      // Refresh tokens (also covered by onDelete: Cascade, but explicit for clarity)
      await tx.refreshToken.deleteMany({ where: { userId: req.userId } });

      // Saved recipes
      await tx.savedRecipe.deleteMany({ where: { userId: req.userId } });

      // Group memberships
      await tx.groupMember.deleteMany({ where: { userId: req.userId } });

      // Recipes authored by user: cascade ingredients and recipe groups first
      const userRecipes = await tx.recipe.findMany({
        where: { authorId: req.userId },
        select: { id: true },
      });
      const recipeIds = userRecipes.map((r) => r.id);

      if (recipeIds.length > 0) {
        await tx.recipeGroup.deleteMany({ where: { recipeId: { in: recipeIds } } });
        await tx.ingredient.deleteMany({ where: { recipeId: { in: recipeIds } } });
        await tx.savedRecipe.deleteMany({ where: { recipeId: { in: recipeIds } } });
        await tx.recipe.deleteMany({ where: { id: { in: recipeIds } } });
      }

      // Groups owned by user
      await tx.group.deleteMany({ where: { ownerId: req.userId } });

      // User row
      await tx.user.delete({ where: { id: req.userId } });
    });

    return res.status(200).json({ status: 'deleted' });
  } catch (error) {
    console.error('Account deletion error:', error);
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
