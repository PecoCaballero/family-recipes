'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SceneContent } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { ContentSkeleton } from '@/app/_components/ContentSkeleton';
import { ChipFilter, type ChipOption } from '@/app/_components/ChipFilter';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useGroupQuery } from '@/app/_hooks/groups';
import { routes, generatePath } from '@/app/_utils/routes';
import { Settings } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { MemberWithCount, Recipe } from '@family-recipe/shared';
import { resolveAvatarUrl } from '@/app/_utils/avatarUrl';

export default function GroupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useGroupQuery(params.id);
  const [selectedChip, setSelectedChip] = useState<ChipOption | undefined>();

  const members = data?.members ?? [];
  const recipes = data?.recipes ?? [];
  const group = data?.group;

  const chipOptions: ChipOption[] = useMemo(() => {
    return [
      { label: t('groups.view.allRecipes') },
      ...members.map((m: MemberWithCount) => ({
        label: m.name,
        avatar: resolveAvatarUrl(m.avatar),
      })),
    ];
  }, [members, t]);

  const filteredRecipes = useMemo(() => {
    if (!selectedChip || selectedChip.label === t('groups.view.allRecipes')) {
      return recipes;
    }
    const selectedMember = members.find((m: MemberWithCount) => m.name === selectedChip.label);
    if (!selectedMember) return recipes;
    return recipes.filter((r: Recipe) => r.authorId === selectedMember.id);
  }, [recipes, selectedChip, members, t]);

  if (isLoading || !data) {
    return (
      <SceneContent>
        <Header goBack title={t('groups.view.title')} />
        <ContentSkeleton variant="card" count={3} />
      </SceneContent>
    );
  }

  const settingsPath = generatePath(routes.groups.settings.path, { id: params.id });

  return (
    <SceneContent>
      <Header
        goBack
        title={group?.name ?? t('groups.view.title')}
        endSlot={
          <IconButton
            aria-label={t('groups.settings.title')}
            onClick={() => router.push(settingsPath)}
          >
            <Settings />
          </IconButton>
        }
      />
      {members.length > 1 && (
        <ChipFilter
          options={chipOptions}
          selectedOption={selectedChip}
          onSelect={setSelectedChip}
        />
      )}
      <RecipeList recipes={filteredRecipes} />
    </SceneContent>
  );
}
