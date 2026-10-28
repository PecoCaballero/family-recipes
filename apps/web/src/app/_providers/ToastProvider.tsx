'use client';

import { Alert, Snackbar, type AlertColor } from '@mui/material';
import { createContext, useCallback, useContext, useState } from 'react';
import { PpWC } from '@/app/_types/types';
import { useAuth } from './AuthContext';

type ToastSeverity = AlertColor;

type ToastContextType = {
  showToast: (message: string, severity?: ToastSeverity) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: PpWC) {
  const { user } = useAuth();
  const notificationsEnabled = user?.settings.notifications ?? true;
  const [toast, setToast] = useState<{ message: string; severity: ToastSeverity } | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = useCallback(
    (message: string, severity: ToastSeverity = 'info') => {
      if (!notificationsEnabled && severity !== 'error') return;
      setToast({ message, severity });
      setOpen(true);
    },
    [notificationsEnabled],
  );

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast?.severity ?? 'info'} variant="filled">
          {toast?.message ?? ''}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
