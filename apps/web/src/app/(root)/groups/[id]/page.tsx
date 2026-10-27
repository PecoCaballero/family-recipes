'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SceneContent } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { RecipeList } from '@/app/_components/RecipeList';
import { SearchInput } from '@/app/_components/SearchInput';
import { ContentSkeleton } from '@/app/_components/ContentSkeleton';
import { ChipFilter, type ChipOption } from '@/app/_components/ChipFilter';
import { FloatingActionButton } from '@/app/_components/FloatingActionButton';
import { EmptyRecipeState } from '@/app/_components/EmptyState';
import { BulkShareDialog } from '@/app/_components/BulkShareDialog';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useGroupQuery, useRemoveRecipeFromGroup } from '@/app/_hooks/groups';
import { useToast } from '@/app/_providers/ToastProvider';
import { filterRecipesByQuery } from '@/app/_utils/recipeFilters';
import { routes, generatePath } from '@/app/_utils/routes';
import { Settings, Share } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import type { MemberWithCount, Recipe } from '@family-recipe/shared';
import { resolveAvatarUrl } from '@/app/_utils/avatarUrl';

export default function GroupPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useGroupQuery(params.id);
  const removeRecipe = useRemoveRecipeFromGroup();
  const [selectedChip, setSelectedChip] = useState<ChipOption | undefined>({
    label: t('groups.view.allRecipes'),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Recipe | null>(null);

  const members = useMemo(() => data?.members ?? [], [data?.members]);
  const recipes = useMemo(() => data?.recipes ?? [], [data?.recipes]);
  const group = data?.group;

  const activeMembers = useMemo(
    () => members.filter((m: MemberWithCount) => m.recipeCount > 0),
    [members],
  );

  const chipOptions: ChipOption[] = useMemo(() => {
    return [
      { label: t('groups.view.allRecipes') },
      ...activeMembers.map((m: MemberWithCount) => ({
        label: m.name,
        avatar: resolveAvatarUrl(m.avatar),
      })),
    ];
  }, [activeMembers, t]);

  const filteredRecipes = useMemo(() => {
    const searched = filterRecipesByQuery(recipes, searchQuery);
    if (!selectedChip || selectedChip.label === t('groups.view.allRecipes')) {
      return searched;
    }
    const selectedMember = members.find((m: MemberWithCount) => m.name === selectedChip.label);
    if (!selectedMember) return searched;
    return searched.filter((r: Recipe) => r.authorId === selectedMember.id);
  }, [recipes, searchQuery, selectedChip, members, t]);

  if (isLoading || !data) {
    return (
      <SceneContent>
        <Header goBack title={t('groups.view.title')} />
        <ContentSkeleton variant="rows" />
      </SceneContent>
    );
  }

  const settingsPath = generatePath(routes.groups.settings.path, { id: params.id });

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    removeRecipe.mutate(
      { groupId: params.id, recipeId: removeTarget.id },
      {
        onSuccess: () => {
          showToast(t('groups.removedFromGroup'), 'success');
          setRemoveTarget(null);
        },
        onError: () => {
          showToast(t('common.error'), 'error');
        },
      },
    );
  };

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
      <Box
        sx={{
          px: 2,
          pt: 1,
          pb: 1,
          position: 'sticky',
          top: 80,
          zIndex: 998,
          bgcolor: 'background.default',
        }}
      >
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search.searchPlaceholder')}
        />
      </Box>
      {activeMembers.length > 0 && (
        <ChipFilter
          options={chipOptions}
          selectedOption={selectedChip}
          onSelect={setSelectedChip}
        />
      )}
      <Box sx={{ px: 2, pt: 1 }}>
        {filteredRecipes.length > 0 ? (
          <RecipeList
            recipes={filteredRecipes}
            onRemove={data.isAdmin ? setRemoveTarget : undefined}
            removeLabel={t('groups.removeRecipe')}
          />
        ) : (
          <EmptyRecipeState
            message={searchQuery ? t('search.noResults') : t('recipes.noRecipes')}
          />
        )}
      </Box>
      <FloatingActionButton
        icon={<Share />}
        onClick={() => setShareOpen(true)}
        label={t('groups.fabShareTooltip')}
      />
      <BulkShareDialog open={shareOpen} onClose={() => setShareOpen(false)} groupId={params.id} />
      <ConfirmDialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title={t('groups.removeRecipeConfirm')}
        message={t('groups.removeRecipeConfirmMessage')}
        onConfirm={handleRemoveConfirm}
        loading={removeRecipe.isPending}
        confirmLabel={t('common.delete')}
      />
    </SceneContent>
  );
}
