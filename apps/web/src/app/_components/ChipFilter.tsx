import React from 'react';
import { Avatar, Chip, Stack } from '@mui/material';

export type ChipOption = {
  label: string;
  avatar?: string;
};

type PpChipFilter = {
  options: ChipOption[];
  selectedOption?: ChipOption;
  onSelect: (option: ChipOption | undefined) => void;
  variant?: 'solid' | 'outlined';
};

export function ChipFilter({
  options,
  selectedOption,
  onSelect,
  variant = 'outlined',
}: PpChipFilter) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        my: 1,
        px: 0.5,
        pb: 0.5,
        width: '100%',
        maxWidth: '100%',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {options.map((option) => {
        const selected = selectedOption?.label === option.label;
        if (variant === 'solid') {
          return (
            <Chip
              key={option.label}
              label={option.label}
              avatar={option.avatar ? <Avatar src={option.avatar} /> : undefined}
              onClick={() => onSelect(selected ? undefined : option)}
              variant="filled"
              color="primary"
              sx={{
                flex: '0 0 auto',
                color: '#fff',
                '& .MuiChip-label': { color: '#fff' },
                bgcolor: selected ? 'primary.main' : 'primary.dark',
                border: `2px solid ${selected ? 'transparent' : '#fff'}`,
              }}
            />
          );
        }
        return (
          <Chip
            key={option.label}
            label={option.label}
            avatar={option.avatar ? <Avatar src={option.avatar} /> : undefined}
            onClick={() => onSelect(selected ? undefined : option)}
            variant={selected ? 'filled' : 'outlined'}
            color="primary"
            sx={{ flex: '0 0 auto' }}
          />
        );
      })}
    </Stack>
  );
}
