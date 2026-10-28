'use client';

import { Group } from '@family-recipe/shared';
import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { SafeAvatar } from './SafeAvatar';
import { ListRow } from './ListRow';
import { useTranslation } from 'react-i18next';

export type PpGroupList = { groups: Group[] };

export function GroupList({ groups }: PpGroupList) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!groups.length) {
    return null;
  }

  return (
    <Stack spacing={1}>
      {groups.map((group: Group) => (
        <ListRow
          key={group.id}
          leading={<SafeAvatar src={group.icon} />}
          title={group.name}
          subtitle={t('groups.settings.recipeCount', { count: group.recipeIds.length })}
          trailing={
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {new Date(group.lastUpdated).toLocaleDateString()}
            </Typography>
          }
          onClick={() => router.push(`/groups/${group.id}`)}
        />
      ))}
    </Stack>
  );
}
