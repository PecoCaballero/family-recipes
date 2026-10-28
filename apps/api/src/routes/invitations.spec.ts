import express from 'express';
import request from 'supertest';
import { prisma } from '../lib/prisma';
import { invitationRouter } from './invitations';

jest.mock('../lib/prisma', () => ({
  prisma: {
    groupAdmin: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    groupMember: { findUnique: jest.fn() },
    invitation: { findFirst: jest.fn(), create: jest.fn() },
  },
}));

const groupAdmin = prisma.groupAdmin as unknown as { findUnique: jest.Mock };
const user = prisma.user as unknown as { findUnique: jest.Mock };
const invitation = prisma.invitation as unknown as {
  findFirst: jest.Mock;
  create: jest.Mock;
};

const INVITEE = '22222222-2222-4222-8222-222222222222';

function makeApp(userId = 'admin-1') {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.userId = userId;
    next();
  });
  app.use('/groups/:id/invitations', invitationRouter);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
  groupAdmin.findUnique.mockResolvedValue({ groupId: 'g1', userId: 'admin-1' });
});

describe('POST /groups/:id/invitations', () => {
  it('returns 404 when the invitee does not exist', async () => {
    user.findUnique.mockResolvedValue(null);

    const res = await request(makeApp())
      .post('/groups/g1/invitations')
      .send({ inviteeUserId: INVITEE });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'user_not_found' });
    expect(invitation.create).not.toHaveBeenCalled();
  });

  it('returns 404 when the invitee is not found and does not create an invitation', async () => {
    groupAdmin.findUnique.mockResolvedValue(null); // non-admin
    const res = await request(makeApp())
      .post('/groups/g1/invitations')
      .send({ inviteeUserId: INVITEE });

    expect(res.status).toBe(403);
    expect(user.findUnique).not.toHaveBeenCalled();
  });
});
