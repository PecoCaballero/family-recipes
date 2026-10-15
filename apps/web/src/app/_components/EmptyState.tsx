'use client';

import { ImportContacts, GroupWork } from '@mui/icons-material';
import { Typography, Stack, Button } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type PpEmptyState = {
  message?: string;
  actionLabel?: string;
  actionHref?: string;
};

function EmptyStateShell({
  icon,
  message,
  actionLabel,
  actionHref,
}: PpEmptyState & { icon: React.ReactNode }) {
  return (
    <Stack alignItems="center" flex={1} justifyContent="center" spacing={2} sx={{ p: 3 }}>
      {icon}
      <Typography variant="h6" align="center" color="text.secondary">
        {message}
      </Typography>
      {actionLabel && actionHref && (
        <Button component={Link} href={actionHref} variant="contained">
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

export function EmptyRecipeState({ message, actionLabel, actionHref }: PpEmptyState) {
  const { t } = useTranslation();

  return (
    <EmptyStateShell
      icon={<ImportContacts fontSize="large" color="disabled" />}
      message={message ?? t('recipes.noRecipes')}
      actionLabel={actionLabel}
      actionHref={actionHref}
    />
  );
}

export function EmptyGroupState({ message, actionLabel, actionHref }: PpEmptyState) {
  const { t } = useTranslation();

  return (
    <EmptyStateShell
      icon={<GroupWork fontSize="large" color="disabled" />}
      message={message ?? t('groups.noGroups')}
      actionLabel={actionLabel}
      actionHref={actionHref}
    />
  );
}
