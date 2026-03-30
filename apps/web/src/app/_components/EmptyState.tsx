import { ImportContacts } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { CenteredFullPage } from './SceneComponents';

export function EmptyRecipeState({ message }: { message?: string }) {
  return (
    <CenteredFullPage>
      <ImportContacts fontSize='large'/>
      <Typography variant="h6" align="center" color="textSecondary">
        No recipes found. {message}
      </Typography>
    </CenteredFullPage>
  );
}
