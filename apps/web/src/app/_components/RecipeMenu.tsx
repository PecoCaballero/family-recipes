import { Recipe } from '@family-recipe/shared';
import { Delete, Edit, Favorite, FavoriteBorder, Send, Share } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAnchor } from '../_hooks/useAnchor';
import { useSaveRecipe, useUnsaveRecipe } from '../_hooks/recipes';
import { SendRecipeDrawer } from './SendRecipeDrawer';

type PpRecipeMenu = {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  recipe: Recipe;
  onDelete?: () => void;
};

export default function RecipeMenu({ anchorEl, open, onClose, recipe, onDelete }: PpRecipeMenu) {
  const { t } = useTranslation();
  const { handleClick, handleClose, open: shareGroupOpen } = useAnchor();
  const router = useRouter();
  const saveRecipe = useSaveRecipe(recipe.id);
  const unsaveRecipe = useUnsaveRecipe(recipe.id);

  const handleSaveToggle = () => {
    onClose();
    if (recipe.isSaved) {
      unsaveRecipe.mutate();
    } else {
      saveRecipe.mutate();
    }
  };

  const handleShare = async () => {
    onClose();
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.name, text: recipe.name, url });
      } catch {
        // user cancelled or the share target failed; no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        window.alert(t('recipes.shareFallbackCopied'));
      } catch (err) {
        console.error('Copy to clipboard failed:', err);
      }
    }
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem onClick={handleSaveToggle}>
          <ListItemIcon>
            {recipe.isSaved ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {recipe.isSaved ? t('recipes.unsaveRecipe') : t('recipes.saveRecipe')}
          </ListItemText>
        </MenuItem>
        {recipe.isAuthor && (
          <>
            <MenuItem onClick={() => router.push(`/recipes/${recipe.id}/edit`)}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('recipes.editRecipe')}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onClose();
                onDelete?.();
              }}
            >
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('recipes.deleteRecipe')}</ListItemText>
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
          <ListItemText>{t('recipes.sendToGroup')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('recipes.share')}</ListItemText>
        </MenuItem>
      </Menu>
      <SendRecipeDrawer open={shareGroupOpen} onClose={handleClose} recipe={recipe} />
    </>
  );
}
