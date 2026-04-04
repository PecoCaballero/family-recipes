import { Typography } from '@mui/material';
import { CenteredFullPage } from '../_components/SceneComponents';
import { CircularProgress } from '@mui/material';

export function LoadingPage() {
  return (
    <CenteredFullPage sx={{ alignItems: 'center' }}>
      <CircularProgress />
      <Typography>Loading...</Typography>
    </CenteredFullPage>
  );
}
