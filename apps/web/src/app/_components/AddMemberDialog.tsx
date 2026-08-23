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
import { useSearchUsers, useAddMember, type UserSearchResult } from '@/app/_hooks/groups';
import { SafeAvatar } from './SafeAvatar';

type PpAddMemberDialog = {
  open: boolean;
  onClose: () => void;
  groupId: string;
};

export function AddMemberDialog({ open, onClose, groupId }: PpAddMemberDialog) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: users = [], isLoading, isError } = useSearchUsers(debouncedEmail);
  const addMember = useAddMember(groupId);

  useEffect(() => {
    if (open) {
      setEmail('');
      setDebouncedEmail('');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmail(email.trim()), 300);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSelect = (user: UserSearchResult) => {
    setError(null);
    addMember.mutate(user.id, {
      onSuccess: () => {
        onClose();
      },
      onError: () => {
        setError(t('common.error'));
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('groups.addMemberTitle')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('groups.emailSearchPlaceholder')}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
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
                <ListItemButton onClick={() => handleSelect(user)} disabled={addMember.isPending}>
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
