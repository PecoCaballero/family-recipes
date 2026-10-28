import express from 'express';
import request from 'supertest';
import { prisma } from '../lib/prisma';
import { usersRouter } from './users';

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: { update: jest.fn(), findUnique: jest.fn() },
  },
}));

const user = prisma.user as unknown as { update: jest.Mock; findUnique: jest.Mock };

function makeApp(userId = 'user-1') {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.userId = userId;
    next();
  });
  app.use('/users', usersRouter);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PATCH /users/me/settings', () => {
  it('rejects an invalid privacyLevel with 400', async () => {
    const res = await request(makeApp())
      .patch('/users/me/settings')
      .send({ privacyLevel: 'not-a-real-level' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
    expect(user.update).not.toHaveBeenCalled();
  });

  it('rejects an invalid theme with 400', async () => {
    const res = await request(makeApp()).patch('/users/me/settings').send({ theme: 'neon' });

    expect(res.status).toBe(400);
    expect(user.update).not.toHaveBeenCalled();
  });

  it('accepts valid settings', async () => {
    user.update.mockResolvedValue({
      id: 'user-1',
      name: 'A',
      email: 'a@b.c',
      avatar: null,
      language: 'en',
      privacyLevel: 'private',
      notifications: false,
      theme: 'dark',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(makeApp())
      .patch('/users/me/settings')
      .send({ theme: 'dark', notifications: false });

    expect(res.status).toBe(200);
    expect(user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { theme: 'dark', notifications: false },
    });
  });
});
