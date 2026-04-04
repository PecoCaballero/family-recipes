import { Avatar, Drawer, List, ListItem, ListItemButton, Typography } from '@mui/material';
import { Recipe } from '../_types/recipe';
import { mockGroups } from '../__mocks__/groups';

type PpSendRecipeDrawer = {
  open: boolean;
  onClose: () => void;
  recipe: Recipe;
};

export function SendRecipeDrawer({ open, onClose, recipe }: PpSendRecipeDrawer) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      sx={{ borderRadius: 2 }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          },
        },
      }}
    >
      <List sx={{ maxHeight: '50vh' }}>
        {mockGroups.map((group) => (
          <ListItem key={group.id} disablePadding>
            <ListItemButton
              sx={{ gap: 1 }}
              key={group.id}
              onClick={() => console.log(`Send recipe ${recipe.name} to group ${group.name}`)}
            >
              <Avatar src={group.icon} />
              <Typography>{group.name}</Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
