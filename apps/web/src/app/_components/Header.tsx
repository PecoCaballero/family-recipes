import { ArrowBack } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { PpWOC } from '../_types/types';

const StyledStack = styled(Stack)(() => ({
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  padding: 2,
  zIndex: 999,
}));

type PpHeader = { title?: string; endSlot?: React.ReactNode; goBack?: boolean } & PpWOC;

export function Header({ title, endSlot, goBack = false, children }: PpHeader): React.ReactElement {
  const router = useRouter();

  return (
    <StyledStack direction="row">
      {goBack && (
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
      )}
      {children && (
        <Stack sx={{ width: '100%', padding: 2, paddingBottom: 1, gap: 1 }}>
          {children}
        </Stack>
      )}
      {title && (
        <Typography
          variant="h6"
          component="h1"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
      )}
      {!children && <Box minWidth={40}>{endSlot}</Box>}
    </StyledStack>
  );
}
