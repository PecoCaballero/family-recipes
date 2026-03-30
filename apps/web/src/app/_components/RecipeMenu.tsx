import { Delete, Edit, Favorite, FavoriteBorder, Send, Share } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { Recipe } from '../_types/recipe';
import { useAnchor } from '../_hooks/useAnchor';
import { SendRecipeDrawer } from './SendRecipeDrawer';

type PpRecipeMenu = {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  recipe: Recipe;
};

export default function RecipeMenu({ anchorEl, open, onClose, recipe }: PpRecipeMenu) {
  const { anchor, handleClick, handleClose, open: shareGroupOpen } = useAnchor();
  return (
    <>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem>
          <ListItemIcon>
            {recipe.isSaved ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </ListItemIcon>
          <ListItemText> {recipe.isSaved ? 'Unsave recipe' : 'Save recipe'} </ListItemText>
        </MenuItem>
        {recipe.isAuthor && (
          <>
            <MenuItem>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit recipe</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Recipe</ListItemText>
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem
          onClick={(e) => {
            onClose();
            handleClick(e);
          }}
        >
          <ListItemIcon>
            <Send fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send to group</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
      </Menu>
      <SendRecipeDrawer open={shareGroupOpen} onClose={handleClose} recipe={recipe} />
    </>
  );
}
