'use client';

import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { GroupList } from '@/app/_components/GroupList';
import { SearchInput } from '@/app/_components/SearchInput';
import { Header } from '@/app/_components/Header';
import { LoadingPage } from '@/app/_scenes/LoadingPage';
import { EmptyGroupState } from '@/app/_components/EmptyState';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@/app/_hooks/useSearch';
import { useGroupsQuery } from '@/app/_hooks/groups';

export default function GroupsPage() {
  const { t } = useTranslation();
  const { searchQuery, handleSearchChange } = useSearch();
  const { data: groups = [], isLoading } = useGroupsQuery(searchQuery || undefined);

  if (isLoading) {
    return <LoadingPage />;
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
        <EmptyGroupState message={t('groups.noGroupsYet')} />
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
      <SceneContent>
        <GroupList groups={groups} />
      </SceneContent>
    </Scene>
  );
}
