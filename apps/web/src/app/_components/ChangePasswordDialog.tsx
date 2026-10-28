'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import { useState, type FormEvent } from 'react';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  currentPasswordLabel: string;
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  cancelLabel: string;
  saveLabel: string;
  passwordTooShortError: string;
  passwordsMismatchError: string;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
  saving?: boolean;
  error?: string | null;
}

export function ChangePasswordDialog({
  open,
  onClose,
  title,
  currentPasswordLabel,
  newPasswordLabel,
  confirmPasswordLabel,
  cancelLabel,
  saveLabel,
  passwordTooShortError,
  passwordsMismatchError,
  onSave,
  saving,
  error,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (newPassword.length < 6) {
      setValidationError(passwordTooShortError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError(passwordsMismatchError);
      return;
    }

    try {
      await onSave(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch {
      // error handled via prop
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {(error || validationError) && (
              <Alert severity="error">{error || validationError}</Alert>
            )}
            <TextField
              label={currentPasswordLabel}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label={newPasswordLabel}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label={confirmPasswordLabel}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            {cancelLabel}
          </Button>
          <Button type="submit" variant="contained" loading={saving}>
            {saveLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
