'use client';

import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { RecipeImportDraft } from '@family-recipe/shared';
import { useImportRecipe } from '../_hooks/recipes';

type PpRecipeImportStep = {
  onDraft: (draft: RecipeImportDraft) => void;
};

function importErrorMessage(err: unknown): string {
  const code = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
  if (code === 'ai_not_configured') return 'recipes.importNotConfigured';
  if (code === 'import_unparseable') return 'recipes.importUnparseable';
  return 'recipes.importError';
}

export function RecipeImportStep({ onDraft }: PpRecipeImportStep) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const importMutation = useImportRecipe();

  const handleParse = async () => {
    if (!text.trim() || importMutation.isPending) return;
    setErrorKey(null);
    try {
      const draft = await importMutation.mutateAsync(text);
      onDraft(draft);
    } catch (err) {
      setErrorKey(importErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2} sx={{ px: 2, py: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {t('recipes.importPrivacyNote')}
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={8}
        label={t('recipes.importRecipe')}
        placeholder={t('recipes.importPastePrompt')}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {errorKey && <Alert severity="error">{t(errorKey)}</Alert>}
      <Button
        variant="contained"
        onClick={handleParse}
        disabled={!text.trim() || importMutation.isPending}
      >
        {importMutation.isPending ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} color="inherit" />
            {t('recipes.importParsing')}
          </Box>
        ) : (
          t('recipes.importParse')
        )}
      </Button>
    </Stack>
  );
}
