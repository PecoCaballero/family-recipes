'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { Header } from '@/app/_components/Header';
import { useGroupQuery, useUpdateGroup } from '@/app/_hooks/groups';

export default function EditGroupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useGroupQuery(params.id);
  const updateGroup = useUpdateGroup(params.id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data?.group) {
      setName(data.group.name ?? '');
      setDescription(data.group.description ?? '');
      setIcon(data.group.icon ?? '');
    }
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !description.trim()) {
      setError(t('groups.edit.validationRequired'));
      return;
    }

    updateGroup.mutate(
      { name: name.trim(), description: description.trim(), icon: icon.trim() || undefined },
      {
        onSuccess: () => {
          router.push(`/groups/${params.id}`);
        },
        onError: () => {
          setError(t('groups.edit.error'));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <>
        <Header goBack title={t('groups.edit.title')} />
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Header goBack title={t('groups.edit.title')} />
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
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={updateGroup.isPending}
          sx={{ mt: 3 }}
        >
          {updateGroup.isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t('groups.edit.button')
          )}
        </Button>
      </Box>
    </>
  );
}
