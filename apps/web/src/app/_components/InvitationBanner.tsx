'use client';

import { Button, Card, Stack, Typography } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTranslation } from 'react-i18next';
import { useAcceptInvitation } from '@/app/_hooks/groups';
import { radius } from '../_theme/tokens';
import type { PendingInvitation } from '@family-recipe/shared';

export function InvitationBanner({ invitation }: { invitation: PendingInvitation }) {
  const { t } = useTranslation();
  const acceptInvitation = useAcceptInvitation(invitation.groupId);

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{ borderRadius: `${radius.md}px`, borderColor: 'primary.main', bgcolor: 'action.hover' }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5 }}>
        <MailOutlineIcon color="primary" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          {t('groups.invitationBanner', {
            groupName: invitation.groupName,
            inviterName: invitation.inviterName,
          })}
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={() => acceptInvitation.mutate(invitation.id)}
          disabled={acceptInvitation.isPending}
          sx={{ flex: '0 0 auto' }}
        >
          {t('groups.invitationAccept')}
        </Button>
      </Stack>
    </Card>
  );
}
