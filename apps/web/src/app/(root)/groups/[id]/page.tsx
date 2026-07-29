'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SceneContent } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { ContentSkeleton } from '@/app/_components/ContentSkeleton';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useGroupQuery, useDeleteGroup } from '@/app/_hooks/groups';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from '@mui/material';

export default function GroupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useGroupQuery(params.id);
  const deleteGroup = useDeleteGroup(params.id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <SceneContent>
        <Header goBack title={t('groups.view.title')} />
        <ContentSkeleton variant="card" count={3} />
      </SceneContent>
    );
  }

  const group = data?.group;
  const recipes = data?.recipes ?? [];
  const isOwner = data?.isOwner ?? false;

  const handleDelete = () => {
    deleteGroup.mutate(undefined, {
      onSuccess: () => {
        router.push('/groups');
      },
    });
  };

  return (
    <SceneContent>
      <Header goBack title={group?.name ?? t('groups.view.title')} />
      {isOwner && (
        <Box sx={{ display: 'flex', gap: 1, px: 2, pt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/groups/${params.id}/edit`)}
          >
            {t('common.edit')}
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={() => setDeleteOpen(true)}>
            {t('common.delete')}
          </Button>
        </Box>
      )}
      <RecipeList recipes={recipes} />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('groups.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <Typography>{t('groups.deleteConfirmMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteGroup.isPending}>
            {deleteGroup.isPending ? <CircularProgress size={20} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </SceneContent>
  );
}
