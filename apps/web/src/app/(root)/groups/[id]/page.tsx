'use client';

import { SceneContent } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { LoadingPage } from '@/app/_scenes/LoadingPage';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useGroupQuery } from '@/app/_hooks/groups';

export default function GroupPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useGroupQuery(params.id);

  if (isLoading) {
    return <LoadingPage />;
  }

  const group = data?.group;
  const recipes = data?.recipes ?? [];

  return (
    <SceneContent>
      <Header goBack title={group?.name ?? t('groups.view.title')} />
      <RecipeList recipes={recipes} />
    </SceneContent>
  );
}
