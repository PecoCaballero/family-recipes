'use client';

import { Scene } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { SearchInput } from '@/app/_components/SearchInput';
import { EmptyRecipeState } from '@/app/_components/EmptyState';

export default function SearchPage() {
  return (
    <Scene>
      <Header>
        <SearchInput value={'test'} onChange={() => {}} placeholder="Search recipes..." />
      </Header>
      <EmptyRecipeState />
    </Scene>
  );
}
