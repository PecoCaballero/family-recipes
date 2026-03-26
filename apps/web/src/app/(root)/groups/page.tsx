'use client';

import { TextField, Box } from '@mui/material';
import { SceneContainer } from '@/app/_components/sceneContainer';
import { mockGroups } from '@/app/__mocks__/groups';
import { GroupList } from '@/app/_components/GroupList';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchFilter } from '@/app/_hooks/useSearchFilter';
import { SearchInput } from '@/app/_components/SearchInput';
import { Header } from '@/app/_components/Header';

export default function GroupsPage() {
  const { filteredData, searchQuery, setSearchQuery } = useSearchFilter(mockGroups, 'name');

  return (
    <SceneContainer>
      <Header>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search groups..."
        />
      </Header>
      <GroupList groups={filteredData} />
    </SceneContainer>
  );
}
