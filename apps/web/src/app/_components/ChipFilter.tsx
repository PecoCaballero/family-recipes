import React from 'react';
import { Avatar, Chip, Stack } from '@mui/material';


export type ChipOption = {
  label: string;
  avatar?: string;
}

type PpChipFilter = {
  options: ChipOption[];
  selectedOption?: ChipOption;
  onSelect: (option: ChipOption | undefined) => void;
}

export function ChipFilter({ options, selectedOption, onSelect }: PpChipFilter) {
  return (
    <Stack direction="row" spacing={1}>
      {options.map((option) => (
        <Chip
          key={option.label}
          label={option.label}
          avatar={option.avatar ? <Avatar src={option.avatar} /> : undefined}
          onClick={() => onSelect(selectedOption?.label === option.label ? undefined : option)}
          variant={selectedOption?.label === option.label ? 'filled' : 'outlined'}
          color={selectedOption?.label === option.label ? 'primary' : 'default'}
        />
      ))}
    </Stack>
  );
}