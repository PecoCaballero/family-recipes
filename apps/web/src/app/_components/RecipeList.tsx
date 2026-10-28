import { Box, Card, CardActionArea, CardMedia, IconButton, Stack, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { Recipe } from '@family-recipe/shared';
import { radius } from '../_theme/tokens';

export type PpRecipeList = {
  recipes: Recipe[];
  onRemove?: (recipe: Recipe) => void;
  removeLabel?: string;
};

export function RecipeList({ recipes, onRemove, removeLabel }: PpRecipeList) {
  const router = useRouter();

  return (
    <Stack spacing={1}>
      {recipes.map((recipe: Recipe) => (
        <Card
          key={recipe.id}
          variant="outlined"
          elevation={0}
          sx={{ borderRadius: `${radius.lg}px`, overflow: 'hidden' }}
        >
          <Stack direction="row" alignItems="center">
            <CardActionArea
              onClick={() => router.push(`/recipes/${recipe.id}`)}
              sx={{ flex: 1, p: 1.5 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                {recipe.image ? (
                  <CardMedia
                    component="img"
                    image={recipe.image}
                    alt={recipe.name}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: `${radius.md}px`,
                      flex: '0 0 auto',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: `${radius.md}px`,
                      bgcolor: 'action.hover',
                      display: 'grid',
                      placeItems: 'center',
                      flex: '0 0 auto',
                    }}
                  >
                    <MenuBookIcon color="disabled" />
                  </Box>
                )}
                <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                    {recipe.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {recipe.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {recipe.author}
                  </Typography>
                </Stack>
              </Stack>
            </CardActionArea>
            {onRemove && (
              <IconButton
                aria-label={removeLabel}
                onClick={() => onRemove(recipe)}
                sx={{ mr: 1, flex: '0 0 auto' }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
