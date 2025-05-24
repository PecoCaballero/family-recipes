'use client';

import { Typography } from '@mui/material';
import { routes } from "@/app/_utils/routes";
import { SceneContainer } from '@/app/_components/sceneContainer';
import { mockGroups } from '@/app/__mocks__/groups';
import { GroupList } from '@/app/_components/GroupList';

export default function GroupsPage() {

  return (
    <SceneContainer>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        {routes.groups.base.title}
      </Typography>
      <GroupList groups={mockGroups} />
    </SceneContainer >
  );
}
