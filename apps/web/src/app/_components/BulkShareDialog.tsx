'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRecipesQuery } from '@/app/_hooks/recipes';
import { useGroupQuery, useBatchAddRecipes } from '@/app/_hooks/groups';
import { LoadingButton } from './LoadingButton';
import { ContentSkeleton } from './ContentSkeleton';
import type { Recipe } from '@family-recipe/shared';

type PpBulkShareDialog = {
  open: boolean;
  onClose: () => void;
  groupId: string;
};

export function BulkShareDialog({ open, onClose, groupId }: PpBulkShareDialog) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: recipes = [], isLoading: recipesLoading } = useRecipesQuery();
  const { data: groupData, isLoading: groupLoading } = useGroupQuery(groupId);
  const batchAdd = useBatchAddRecipes(groupId);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedIds([]);
      setError(null);
    }
  }

  const groupRecipeIds = groupData?.group.recipeIds ?? [];
  const unshared = recipes.filter((r: Recipe) => !groupRecipeIds.includes(r.id));

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleConfirm = () => {
    setError(null);
    batchAdd.mutate(selectedIds, {
      onSuccess: () => {
        setSelectedIds([]);
        onClose();
      },
      onError: () => {
        setError(t('common.error'));
      },
    });
  };

  const loading = recipesLoading || groupLoading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('groups.bulkShareTitle')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <ContentSkeleton variant="list" />
        ) : unshared.length === 0 ? (
          <Typography sx={{ py: 2, textAlign: 'center' }}>{t('groups.bulkShareEmpty')}</Typography>
        ) : (
          <List>
            {unshared.map((recipe: Recipe) => (
              <ListItem key={recipe.id} disablePadding>
                <ListItemButton onClick={() => toggle(recipe.id)}>
                  <ListItemAvatar>
                    <Checkbox checked={selectedIds.includes(recipe.id)} tabIndex={-1} />
                  </ListItemAvatar>
                  <ListItemText primary={recipe.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <LoadingButton
          loading={batchAdd.isPending}
          color="primary"
          onClick={handleConfirm}
          disabled={selectedIds.length === 0 || loading}
        >
          {t('groups.bulkShareConfirm')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
