'use client';

import { Typography, } from '@mui/material';
import { SceneContainer } from "@/app/_components/sceneContainer";
import { routes } from "@/app/_utils/routes";
import { Header } from "@/app/_components/Header";

export default function GroupPage() {
  return (
    <SceneContainer>
      <Header goBack title={routes.groups.view.title} />

      <Typography variant="body1">
        This is the group detail page
      </Typography>
    </SceneContainer>
  );
}
