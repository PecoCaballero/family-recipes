'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from './LoadingButton';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  error?: string | null;
  onConfirm: () => void;
  loading: boolean;
  confirmLabel: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  error,
  onConfirm,
  loading,
  confirmLabel,
  cancelLabel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel ?? t('common.cancel')}</Button>
        <LoadingButton loading={loading} color="error" onClick={onConfirm}>
          {confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
