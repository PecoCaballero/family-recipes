'use client';

import type { Ingredient, Recipe, RecipeDifficulty } from '@family-recipe/shared';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IngredientsList } from './IngredientsList';
import { useRecipesQuery } from '../_hooks/recipes';

type TpRecipeFormData = {
  name: string;
  description: string;
  image?: string;
  ingredients: Ingredient[];
  instructions: string;
  parentRecipeId?: string;
  cuisine?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: RecipeDifficulty;
};

type TpStringField = 'name' | 'description' | 'image' | 'instructions' | 'cuisine';
type TpNumberField = 'prepTime' | 'cookTime' | 'servings';

type PpRecipeForm = {
  recipe: Recipe;
  isEditing?: boolean;
  initialData?: Partial<TpRecipeFormData>;
  hideActions?: boolean;
  onSubmit?: (data: TpRecipeFormData) => Promise<void>;
};

export type RecipeFormHandle = {
  submitForm: () => void;
};

export const RecipeForm = forwardRef<RecipeFormHandle, PpRecipeForm>(function RecipeForm(
  { recipe, isEditing = false, initialData, hideActions = false, onSubmit },
  ref,
) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: allRecipes = [] } = useRecipesQuery();
  const parentOptions = allRecipes.filter((option) => option.id !== recipe.id);

  const initialFormData = (): TpRecipeFormData => {
    if (isEditing && recipe) {
      return {
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        parentRecipeId: recipe.parentRecipe?.id,
        cuisine: recipe.cuisine,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
      };
    }
    return {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      image: initialData?.image ?? '',
      ingredients:
        initialData?.ingredients && initialData.ingredients.length > 0
          ? initialData.ingredients
          : [{ name: '', quantity: '', unit: '' }],
      instructions: initialData?.instructions ?? '',
      parentRecipeId: initialData?.parentRecipeId,
      cuisine: initialData?.cuisine,
      prepTime: initialData?.prepTime,
      cookTime: initialData?.cookTime,
      servings: initialData?.servings,
      difficulty: initialData?.difficulty,
    };
  };

  const [formData, setFormData] = useState<TpRecipeFormData>(initialFormData());
  const [errors, setErrors] = useState<Partial<TpRecipeFormData>>({});
  const [loading, setLoading] = useState(false);

  const selectedParent =
    parentOptions.find((option) => option.id === formData.parentRecipeId) ?? null;

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
    (field: TpStringField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleNumberChange =
    (field: TpNumberField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: raw === '' ? undefined : Number(raw),
      }));
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

  const doSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }

      router.push('/recipes');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      void doSubmit();
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doSubmit();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ py: 2, px: 2 }}>
      <TextField
        fullWidth
        label={t('recipes.recipeName')}
        value={formData.name}
        onChange={handleInputChange('name')}
        error={!!errors.name}
        helperText={
          errors.name ? t('recipes.fieldRequired', { field: t('recipes.recipeName') }) : ''
        }
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
        placeholder={t('recipes.descriptionPlaceholder')}
      />

      <TextField
        fullWidth
        label={t('recipes.imageUrl')}
        value={formData.image}
        onChange={handleInputChange('image')}
        margin="normal"
        placeholder={t('recipes.imagePlaceholder')}
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

      <Autocomplete
        options={parentOptions}
        value={selectedParent}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_event, value) =>
          setFormData((prev) => ({ ...prev, parentRecipeId: value?.id }))
        }
        renderInput={(params) => (
          <TextField {...params} label={t('recipes.basedOn')} margin="normal" />
        )}
      />

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
        helperText={
          errors.instructions
            ? t('recipes.fieldRequired', { field: t('recipes.instructions') })
            : ''
        }
        margin="normal"
        multiline
        rows={6}
        required
        placeholder={t('recipes.instructionsPlaceholder')}
      />

      <Accordion elevation={0} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t('recipes.additionalDetails')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={t('recipes.cuisine')}
              value={formData.cuisine ?? ''}
              onChange={handleInputChange('cuisine')}
            />
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
              label={t('recipes.prepTime')}
              value={formData.prepTime ?? ''}
              onChange={handleNumberChange('prepTime')}
            />
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
              label={t('recipes.cookTime')}
              value={formData.cookTime ?? ''}
              onChange={handleNumberChange('cookTime')}
            />
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
              label={t('recipes.servings')}
              value={formData.servings ?? ''}
              onChange={handleNumberChange('servings')}
            />
            <TextField
              fullWidth
              select
              label={t('recipes.difficulty')}
              value={formData.difficulty ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  difficulty:
                    e.target.value === '' ? undefined : (e.target.value as RecipeDifficulty),
                }))
              }
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="easy">{t('recipes.difficultyEasy')}</MenuItem>
              <MenuItem value="medium">{t('recipes.difficultyMedium')}</MenuItem>
              <MenuItem value="hard">{t('recipes.difficultyHard')}</MenuItem>
            </TextField>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {!hideActions && (
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
      )}
    </Box>
  );
});
