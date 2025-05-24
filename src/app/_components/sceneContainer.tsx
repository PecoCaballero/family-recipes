'use client';

import { Box } from '@mui/material';
import { FC } from 'react';

interface SceneContainerProps {
  children?: React.ReactNode;
}

export const SceneContainer: FC<SceneContainerProps> = ({
  children,
}) => {
  return (
    <Box sx={{ maxWidth: '1200px', }}>
      {children}
    </Box>
  );
};
