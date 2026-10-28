import { InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export function SearchInput({ sx, slotProps, ...props }: TextFieldProps) {
  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      size="small"
      slotProps={{
        ...slotProps,
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          ...(slotProps?.input as Record<string, unknown>),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 999,
          backgroundColor: 'background.paper',
          '& fieldset': {
            borderColor: 'divider',
          },
        },
        ...sx,
      }}
    />
  );
}
