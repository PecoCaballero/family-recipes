import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { createInvitationSchema } from '@family-recipe/shared';

export const invitationRouter = Router({ mergeParams: true });

async function isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
  const admin = await prisma.groupAdmin.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return admin !== null;
}

function invitationToResponse(invitation: {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeUserId: string;
  status: string;
  expiresAt: Date;
}) {
  return {
    id: invitation.id,
    groupId: invitation.groupId,
    inviterId: invitation.inviterId,
    inviteeUserId: invitation.inviteeUserId,
    status: invitation.status,
    expiresAt: invitation.expiresAt.toISOString(),
  };
}

// POST /v1/groups/:id/invitations
invitationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;

    const parsed = createInvitationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'validation_error',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    const { inviteeUserId } = parsed.data;

    if (!(await isGroupAdmin(groupId, req.userId!))) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const invitee = await prisma.user.findUnique({ where: { id: inviteeUserId } });
    if (!invitee) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: inviteeUserId } },
    });
    if (existingMember) {
      return res.status(409).json({ error: 'user_already_member' });
    }

    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        groupId,
        inviteeUserId,
        status: 'pending',
      },
    });
    if (existingInvitation) {
      return res.status(200).json({ invitation: invitationToResponse(existingInvitation) });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        groupId,
        inviterId: req.userId!,
        inviteeUserId,
        expiresAt,
      },
    });

    return res.status(201).json({ invitation: invitationToResponse(invitation) });
  } catch (error) {
    console.error('Create invitation error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /v1/groups/:id/invitations/:invitationId/accept
invitationRouter.post('/:invitationId/accept', async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;
    const invitationId = req.params.invitationId;

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, groupId },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'invitation_not_found' });
    }

    if (invitation.inviteeUserId !== req.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    if (invitation.status !== 'pending') {
      return res.status(409).json({ error: 'invitation_already_responded' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(410).json({ error: 'invitation_expired' });
    }

    await prisma.$transaction([
      prisma.groupMember.upsert({
        where: {
          groupId_userId: { groupId, userId: req.userId! },
        },
        create: { groupId, userId: req.userId! },
        update: {},
      }),
      prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      }),
    ]);

    return res.status(200).json({ status: 'accepted' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
});
