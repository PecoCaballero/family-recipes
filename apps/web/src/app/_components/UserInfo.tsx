'use client';

import { Avatar, Stack, Typography } from '@mui/material';

interface UserInfoProps {
  name: string;
  email: string;
  avatar?: string;
}

export function UserInfo({ name, email, avatar }: UserInfoProps): React.ReactElement {
  return (
    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
      <Avatar
        src={avatar}
        alt={name}
        sx={{
          width: 80,
          height: 80,
          fontSize: '2rem',
          backgroundColor: 'primary.main',
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <Stack alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {email}
        </Typography>
      </Stack>
    </Stack>
  );
}
