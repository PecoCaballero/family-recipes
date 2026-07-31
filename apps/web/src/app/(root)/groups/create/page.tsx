'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TextField, Box, Typography, Alert } from '@mui/material';
import { Header } from '@/app/_components/Header';
import { LoadingButton } from '@/app/_components/LoadingButton';
import { useCreateGroup } from '@/app/_hooks/groups';

export default function CreateGroupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const createGroup = useCreateGroup();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !description.trim()) {
      setError(t('groups.create.validationRequired'));
      return;
    }

    createGroup.mutate(
      { name: name.trim(), description: description.trim(), icon: icon.trim() || undefined },
      {
        onSuccess: (group) => {
          router.push(`/groups/${group.id}`);
        },
        onError: () => {
          setError(t('groups.create.error'));
        },
      },
    );
  };

  return (
    <>
      <Header goBack title={t('groups.create.title')} />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ px: 2, py: 3, maxWidth: 500, mx: 'auto' }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label={t('groups.nameLabel')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label={t('groups.descriptionLabel')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <TextField
          label={t('groups.iconLabel')}
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          fullWidth
          margin="normal"
          placeholder={t('groups.iconPlaceholder')}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          loading={createGroup.isPending}
          spinnerSize={24}
          sx={{ mt: 3 }}
        >
          {t('groups.create.button')}
        </LoadingButton>
      </Box>
    </>
  );
}
