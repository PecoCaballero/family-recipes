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

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  title: string;
  nameLabel: string;
  emailLabel: string;
  cancelLabel: string;
  saveLabel: string;
  fieldRequiredError: string;
  invalidEmailError: string;
  onSave: (name: string, email: string) => Promise<void>;
  saving?: boolean;
  error?: string | null;
}

export function EditProfileDialog({
  open,
  onClose,
  currentName,
  currentEmail,
  title,
  nameLabel,
  emailLabel,
  cancelLabel,
  saveLabel,
  fieldRequiredError,
  invalidEmailError,
  onSave,
  saving,
  error,
}: EditProfileDialogProps) {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim() && !email.trim()) {
      setValidationError(fieldRequiredError);
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError(invalidEmailError);
      return;
    }

    try {
      await onSave(name.trim() || currentName, email.trim() || currentEmail);
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
              label={nameLabel}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label={emailLabel}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
