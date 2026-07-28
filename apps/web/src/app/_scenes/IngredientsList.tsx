'use client';

import type { Ingredient } from '@family-recipe/shared';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type PpIngredientsList = {
  ingredients: Ingredient[];
  errors?: boolean;
  onIngredientAdd: (ingredient: Ingredient) => void;
  onIngredientUpdate: (index: number, ingredient: Ingredient) => void;
  onIngredientRemove: (index: number) => void;
};

export function IngredientsList({
  ingredients,
  errors,
  onIngredientAdd,
  onIngredientUpdate,
  onIngredientRemove,
}: PpIngredientsList) {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Ingredient>({
    name: '',
    quantity: '',
    unit: '',
  });

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setFormData(ingredients[index]);
    } else {
      setEditingIndex(null);
      setFormData({ name: '', quantity: '', unit: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndex(null);
    setFormData({ name: '', quantity: '', unit: '' });
  };

  const handleInputChange =
    (field: keyof Ingredient) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    if (editingIndex !== null) {
      onIngredientUpdate(editingIndex, formData);
    } else {
      onIngredientAdd(formData);
    }

    handleCloseDialog();
  };

  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        {t('recipes.ingredients')} *
      </Typography>
      {errors && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
          All ingredients must have a name
        </Typography>
      )}

      <Stack gap={2}>
        {ingredients.map((ingredient, index) => (
          <Card key={index} variant="outlined">
            <CardContent
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:last-child': { pb: 2 },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ingredient.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ingredient.quantity}
                  {ingredient.unit && ` ${ingredient.unit}`}
                </Typography>
              </Box>
              <Stack direction="row" gap={0.5}>
                <IconButton onClick={() => handleOpenDialog(index)} size="small" color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
                {ingredients.length > 1 && (
                  <IconButton onClick={() => onIngredientRemove(index)} size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('recipes.addIngredient')}
        </Button>
      </Stack>

      {/* Add/Edit Ingredient Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? t('recipes.editRecipe') : `${t('recipes.addIngredient')}`}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label={t('recipes.ingredientName')}
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!formData.name.trim() && formData.name !== ''}
            helperText={
              !formData.name.trim() && formData.name !== ''
                ? `${t('recipes.ingredientName')} is required`
                : ''
            }
          />
          <TextField
            fullWidth
            label={t('recipes.quantity')}
            value={formData.quantity}
            onChange={handleInputChange('quantity')}
            placeholder="e.g., 2, 1/2, 3.5"
          />
          <TextField
            fullWidth
            label={t('recipes.unit')}
            value={formData.unit}
            onChange={handleInputChange('unit')}
            placeholder="e.g., cup, tbsp, g"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name.trim()}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
