'use client';

import type { Ingredient, Recipe } from '@family-recipe/shared';
import { Button, Box, Stack, TextField } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IngredientsList } from './IngredientsList';

type TpRecipeFormData = {
  name: string;
  description: string;
  image?: string;
  ingredients: Ingredient[];
  instructions: string;
};

type PpRecipeForm = {
  recipe: Recipe;
  isEditing?: boolean;
  onSubmit?: (data: TpRecipeFormData) => Promise<void>;
};

export function RecipeForm({ recipe, isEditing = false, onSubmit }: PpRecipeForm) {
  const { t } = useTranslation();
  const router = useRouter();

  const initialFormData = (): TpRecipeFormData => {
    if (isEditing && recipe) {
      return {
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
      };
    }
    return {
      name: '',
      description: '',
      image: '',
      ingredients: [{ name: '', quantity: '', unit: '' }],
      instructions: '',
    };
  };

  const [formData, setFormData] = useState<TpRecipeFormData>(initialFormData());
  const [errors, setErrors] = useState<Partial<TpRecipeFormData>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<TpRecipeFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('recipes.recipeName');
    }
    if (!formData.instructions.trim()) {
      newErrors.instructions = t('recipes.instructions');
    }
    if (formData.ingredients.some((ing) => ing.name.trim() === '')) {
      newErrors.ingredients = [{ name: 'placeholder', quantity: '', unit: '' }];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof Omit<TpRecipeFormData, 'ingredients'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleIngredientAdd = (ingredient: Ingredient) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient],
    }));
    if (errors.ingredients) {
      setErrors((prev) => ({
        ...prev,
        ingredients: undefined,
      }));
    }
  };

  const handleIngredientUpdate = (index: number, ingredient: Ingredient) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = ingredient;
    setFormData((prev) => ({
      ...prev,
      ingredients: newIngredients,
    }));
    if (errors.ingredients) {
      setErrors((prev) => ({
        ...prev,
        ingredients: undefined,
      }));
    }
  };

  const handleIngredientRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // TODO: Replace with actual API call
        console.log('Saving recipe:', formData);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      router.push('/recipes');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ py: 2, px: 2 }}>
      <TextField
        fullWidth
        label={t('recipes.recipeName')}
        value={formData.name}
        onChange={handleInputChange('name')}
        error={!!errors.name}
        helperText={errors.name ? `${t('recipes.recipeName')} is required` : ''}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label={t('recipes.description')}
        value={formData.description}
        onChange={handleInputChange('description')}
        margin="normal"
        multiline
        rows={3}
        placeholder="Describe your recipe..."
      />

      <TextField
        fullWidth
        label={t('recipes.imageUrl')}
        value={formData.image}
        onChange={handleInputChange('image')}
        margin="normal"
        placeholder="https://example.com/image.jpg"
        type="url"
      />

      {formData.image && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Image
            src={formData.image}
            alt={formData.name}
            width={300}
            height={200}
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            onError={() => {
              console.error('Failed to load image');
            }}
          />
        </Box>
      )}

      <IngredientsList
        ingredients={formData.ingredients}
        errors={!!errors.ingredients}
        onIngredientAdd={handleIngredientAdd}
        onIngredientUpdate={handleIngredientUpdate}
        onIngredientRemove={handleIngredientRemove}
      />

      <TextField
        fullWidth
        label={t('recipes.instructions')}
        value={formData.instructions}
        onChange={handleInputChange('instructions')}
        error={!!errors.instructions}
        helperText={errors.instructions ? `${t('recipes.instructions')} is required` : ''}
        margin="normal"
        multiline
        rows={6}
        required
        placeholder="Step-by-step instructions..."
      />

      <Stack direction="row" gap={2} sx={{ mt: 4, mb: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ flex: 1 }}
        >
          {isEditing ? t('common.edit') : t('recipes.saveRecipe')}
        </Button>
        <Button variant="outlined" onClick={() => router.push('/recipes')} disabled={loading}>
          {t('common.cancel')}
        </Button>
      </Stack>
    </Box>
  );
}
