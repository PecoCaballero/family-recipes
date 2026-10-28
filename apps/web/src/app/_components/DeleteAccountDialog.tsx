'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import { useState, type FormEvent } from 'react';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  title: string;
  warningText: string;
  confirmPrompt: string;
  cancelLabel: string;
  deleteLabel: string;
  onDelete: () => Promise<void>;
  deleting?: boolean;
  error?: string | null;
}

export function DeleteAccountDialog({
  open,
  onClose,
  email,
  title,
  warningText,
  confirmPrompt,
  cancelLabel,
  deleteLabel,
  onDelete,
  deleting,
  error,
}: DeleteAccountDialogProps) {
  const [emailInput, setEmailInput] = useState('');

  const confirmed = emailInput.trim() === email;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    try {
      await onDelete();
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
            {error && <Alert severity="error">{error}</Alert>}
            <Alert severity="warning">{warningText}</Alert>
            <DialogContentText>{confirmPrompt}</DialogContentText>
            <TextField
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              fullWidth
              placeholder={email}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={deleting}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={!confirmed}
            loading={deleting}
          >
            {deleteLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
