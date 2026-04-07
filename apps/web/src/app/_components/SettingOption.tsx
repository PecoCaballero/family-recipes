'use client';

import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { ThemeMode } from '../_providers/themeContext';

type PpSettingOption = {
  label: string;
  description?: string;
  type: 'toggle' | 'select';
  value: boolean | string;
  onChange: (value: boolean | string | ThemeMode) => void;
  options?: { label: string; value: string }[];
};

export function SettingOption({
  label,
  description,
  type,
  value,
  onChange,
  options,
}: PpSettingOption): React.ReactElement {
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack spacing={0.5} flex={1}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ paddingRight: 1 }}>
            {description}
          </Typography>
        )}
      </Stack>

      {type === 'toggle' && <Switch checked={value as boolean} onChange={handleToggleChange} />}

      {type === 'select' && options && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={value as string} onChange={handleSelectChange}>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}
