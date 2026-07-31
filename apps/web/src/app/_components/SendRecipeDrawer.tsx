import { Drawer, List, ListItem, ListItemButton, Typography } from '@mui/material';
import { Recipe } from '@family-recipe/shared';
import { useGroupsQuery, useAddRecipeToGroup } from '../_hooks/groups';
import { ContentSkeleton } from '../_components/ContentSkeleton';
import { SafeAvatar } from './SafeAvatar';
import { useTranslation } from 'react-i18next';

type PpSendRecipeDrawer = {
  open: boolean;
  onClose: () => void;
  recipe: Recipe;
};

export function SendRecipeDrawer({ open, onClose, recipe }: PpSendRecipeDrawer) {
  const { t } = useTranslation();
  const { data: groups = [], isLoading } = useGroupsQuery();
  const addRecipeToGroup = useAddRecipeToGroup();

  const handleSend = (groupId: string) => {
    addRecipeToGroup.mutate(
      { groupId, recipeId: recipe.id },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <List sx={{ maxHeight: '50vh' }}>
        {isLoading ? (
          <ContentSkeleton variant="list" />
        ) : groups.length === 0 ? (
          <ListItem>
            <Typography sx={{ py: 2, textAlign: 'center', width: '100%' }}>
              {t('groups.noGroupsYet')}
            </Typography>
          </ListItem>
        ) : (
          groups.map((group) => (
            <ListItem key={group.id} disablePadding>
              <ListItemButton
                sx={{ gap: 1 }}
                onClick={() => handleSend(group.id)}
                disabled={addRecipeToGroup.isPending}
              >
                <SafeAvatar src={group.icon} />
                <Typography>{group.name}</Typography>
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Drawer>
  );
}
