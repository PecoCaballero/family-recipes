'use client';

import { Scene, SceneContent } from '@/app/_components/SceneComponents';
import { mockGroups } from '@/app/__mocks__/groups';
import { GroupList } from '@/app/_components/GroupList';
import { useSearchFilter } from '@/app/_hooks/useSearchFilter';
import { SearchInput } from '@/app/_components/SearchInput';
import { Header } from '@/app/_components/Header';
import { useTranslation } from 'react-i18next';

export default function GroupsPage() {
  const { t } = useTranslation();
  const { filteredData, searchQuery, setSearchQuery } = useSearchFilter(mockGroups, 'name');

  return (
    <Scene>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('groups.searchPlaceholder')}
        />
      </Header>
      <SceneContent>
        <GroupList groups={filteredData} />
      </SceneContent>
    </Scene>
  );
}
