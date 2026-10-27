'use client';

import { Link } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function SkipLink() {
  const { t } = useTranslation();

  return (
    <Link
      href="#main-content"
      sx={{
        position: 'absolute',
        left: -9999,
        top: 0,
        zIndex: 10000,
        '&:focus': {
          left: 8,
          top: 8,
          bgcolor: 'background.paper',
          color: 'primary.main',
          px: 2,
          py: 1,
          borderRadius: 1,
          textDecoration: 'none',
        },
      }}
    >
      {t('a11y.skipToContent')}
    </Link>
  );
}
