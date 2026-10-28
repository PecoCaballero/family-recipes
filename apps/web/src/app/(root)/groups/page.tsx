'use client';

import { Add } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { GroupList } from '@/app/_components/GroupList';
import { SearchInput } from '@/app/_components/SearchInput';
import { Header } from '@/app/_components/Header';
import { ContentSkeleton } from '@/app/_components/ContentSkeleton';
import { FloatingActionButton } from '@/app/_components/FloatingActionButton';
import { EmptyGroupState } from '@/app/_components/EmptyState';
import { InvitationBanner } from '@/app/_components/InvitationBanner';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@/app/_hooks/useSearch';
import { useGroupsQuery } from '@/app/_hooks/groups';
import { routes } from '@/app/_utils/routes';

export default function GroupsPage() {
  const { t } = useTranslation();
  const { searchQuery, handleSearchChange } = useSearch();
  const { data, isLoading } = useGroupsQuery(searchQuery || undefined);
  const groups = data?.groups ?? [];
  const pendingInvitations = data?.pendingInvitations ?? [];

  if (isLoading) {
    return (
      <Scene>
        <Header>
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('groups.searchPlaceholder')}
          />
        </Header>
        <SceneContent sx={{ pt: 2 }}>
          <ContentSkeleton variant="rows" />
        </SceneContent>
        <FloatingActionButton
          icon={<Add />}
          href={routes.groups.create.path}
          label={t('groups.fabCreateTooltip')}
        />
      </Scene>
    );
  }

  if (groups.length === 0) {
    return (
      <Scene>
        <Header>
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('groups.searchPlaceholder')}
          />
        </Header>
        <EmptyGroupState
          message={t('groups.noGroupsYet')}
          actionLabel={t('groups.newGroup')}
          actionHref={routes.groups.create.path}
        />
        <SceneContent sx={{ pt: 2 }}>
          {pendingInvitations.map((invitation) => (
            <InvitationBanner key={invitation.id} invitation={invitation} />
          ))}
        </SceneContent>
        <FloatingActionButton
          icon={<Add />}
          href={routes.groups.create.path}
          label={t('groups.fabCreateTooltip')}
        />
      </Scene>
    );
  }

  return (
    <Scene>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('groups.searchPlaceholder')}
        />
      </Header>
      <SceneContent sx={{ pt: 2 }}>
        <Stack spacing={1}>
          {pendingInvitations.map((invitation) => (
            <InvitationBanner key={invitation.id} invitation={invitation} />
          ))}
          <GroupList groups={groups} />
        </Stack>
      </SceneContent>
      <FloatingActionButton
        icon={<Add />}
        href={routes.groups.create.path}
        label={t('groups.fabCreateTooltip')}
      />
    </Scene>
  );
}
