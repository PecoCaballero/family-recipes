'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSearchUsers, useCreateInvitation, type UserSearchResult } from '@/app/_hooks/groups';
import { useToast } from '@/app/_providers/ToastProvider';
import { SafeAvatar } from './SafeAvatar';

type PpInviteMemberDialog = {
  open: boolean;
  onClose: () => void;
  groupId: string;
};

export function InviteMemberDialog({ open, onClose, groupId }: PpInviteMemberDialog) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');

  const { data: users = [], isLoading, isError } = useSearchUsers(debouncedEmail);
  const createInvitation = useCreateInvitation(groupId);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setEmail('');
      setDebouncedEmail('');
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmail(email.trim()), 300);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSelect = (user: UserSearchResult) => {
    createInvitation.mutate(user.id, {
      onSuccess: () => {
        showToast(t('groups.inviteSent'), 'success');
        onClose();
      },
      onError: () => {
        showToast(t('common.error'), 'error');
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('groups.inviteMemberTitle')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('groups.emailSearchPlaceholder')}
        />
        {isLoading ? (
          <Typography sx={{ py: 2, textAlign: 'center' }}>{t('common.loading')}</Typography>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {t('common.error')}
          </Alert>
        ) : debouncedEmail && users.length === 0 ? (
          <Typography sx={{ py: 2, textAlign: 'center' }}>{t('groups.noUsersFound')}</Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(user)}
                  disabled={createInvitation.isPending}
                >
                  <ListItemAvatar>
                    <SafeAvatar src={user.avatar} fallback={user.name.charAt(0)} />
                  </ListItemAvatar>
                  <ListItemText primary={user.name} secondary={user.email} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
