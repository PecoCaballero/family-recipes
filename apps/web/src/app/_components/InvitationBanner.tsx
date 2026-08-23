'use client';

import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAcceptInvitation } from '@/app/_hooks/groups';
import type { PendingInvitation } from '@family-recipe/shared';

export function InvitationBanner({ invitation }: { invitation: PendingInvitation }) {
  const { t } = useTranslation();
  const acceptInvitation = useAcceptInvitation(invitation.groupId);

  return (
    <Alert
      severity="info"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => acceptInvitation.mutate(invitation.id)}
          disabled={acceptInvitation.isPending}
        >
          {t('groups.invitationAccept')}
        </Button>
      }
      sx={{ mb: 1 }}
    >
      {t('groups.invitationBanner', {
        groupName: invitation.groupName,
        inviterName: invitation.inviterName,
      })}
    </Alert>
  );
}
