import { useSearchFilter } from '../_hooks/useSearchFilter';
import { useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export function SearchInput(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      size="small"
      slotProps={{ input: { endAdornment: <SearchIcon /> } }}
    />
  );
}
