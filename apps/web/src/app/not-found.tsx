'use client';

import { useTranslation } from 'react-i18next';
import { GenericErrorScreen } from '@/app/_components/GenericErrorScreen';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <GenericErrorScreen
      title={t('error.notFoundTitle')}
      description={t('error.notFoundDescription')}
      isDevelopment={false}
    />
  );
}
