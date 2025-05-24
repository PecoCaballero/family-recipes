'use client';

import { SceneContainer } from '@/app/_components/sceneContainer';
import { routes } from "@/app/_utils/routes";
import { Typography } from '@mui/material';

export default function EditRecipePage() {
  return (
    <SceneContainer>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {routes.recipes.edit.title}
      </Typography>
      <Typography variant="body1">
        This is the edit recipe page
      </Typography>
    </SceneContainer>
  );
}
