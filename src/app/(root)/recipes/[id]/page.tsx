'use client';

import { routes } from "@/app/_utils/routes";
import { SceneContainer } from '@/app/_components/sceneContainer';
import { Typography } from '@mui/material';

export default function RecipePage() {
  return (
    <SceneContainer>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {routes.recipes.view.title}
      </Typography>
      <Typography variant="body1">
        This is the recipe detail page
      </Typography>
    </SceneContainer>
  );
}
