'use client';

import { useTranslation } from 'react-i18next';
import { Scene } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { SearchInput } from '@/app/_components/SearchInput';
import { EmptyRecipeState } from '@/app/_components/EmptyState';

export default function SearchPage() {
  const { t } = useTranslation();

  return (
    <Scene>
      <Header>
        <SearchInput
          value={'test'}
          onChange={() => {}}
          placeholder={t('search.searchPlaceholder')}
        />
      </Header>
      <EmptyRecipeState />
    </Scene>
  );
}
