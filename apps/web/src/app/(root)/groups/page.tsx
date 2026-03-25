'use client';

import { TextField, Box } from '@mui/material';
import { SceneContainer } from '@/app/_components/sceneContainer';
import { mockGroups } from '@/app/__mocks__/groups';
import { GroupList } from '@/app/_components/GroupList';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchFilter } from '@/app/_hooks/useSearchFilter';

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = useSearchFilter(mockGroups, searchQuery, 'name');

  return (
    <SceneContainer>
      <Box sx={{ margin: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          slotProps={{ input: { endAdornment: <SearchIcon /> } }}
        />
      </Box>

      <GroupList groups={filteredGroups} />
    </SceneContainer>
  );
}
