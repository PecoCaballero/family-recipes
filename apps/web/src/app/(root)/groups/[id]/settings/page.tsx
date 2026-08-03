'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SceneContent } from '@/app/_components/SceneComponents';
import { Header } from '@/app/_components/Header';
import { ContentSkeleton } from '@/app/_components/ContentSkeleton';
import { SafeAvatar } from '@/app/_components/SafeAvatar';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useGroupQuery, useDeleteGroup, useQuitGroup, useRemoveMember } from '@/app/_hooks/groups';
import { routes, generatePath } from '@/app/_utils/routes';
import type { MemberWithCount } from '@family-recipe/shared';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Delete, Edit, PersonRemove } from '@mui/icons-material';

function EditGroupButton({ isAdmin, groupId }: { isAdmin: boolean; groupId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  if (!isAdmin) return null;

  return (
    <IconButton
      aria-label={t('common.edit')}
      onClick={() => router.push(generatePath(routes.groups.edit.path, { id: groupId }))}
    >
      <Edit />
    </IconButton>
  );
}

function KickMemberButton({ canKick, onKick }: { canKick: boolean; onKick: () => void }) {
  const { t } = useTranslation();

  if (!canKick) return null;

  return (
    <IconButton edge="end" aria-label={t('groups.settings.kickMember')} onClick={onKick}>
      <PersonRemove />
    </IconButton>
  );
}

function GroupActionButtons({
  isAdmin,
  isLastMember,
  onDelete,
  onLeave,
}: {
  isAdmin: boolean;
  isLastMember: boolean;
  onDelete: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  const leaveColor = isAdmin ? 'primary' : 'error';

  if (isLastMember) {
    return (
      <Stack spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" color="error" startIcon={<Delete />} onClick={onLeave}>
          {t('groups.settings.leaveAndDelete')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      {isAdmin && (
        <Button variant="outlined" color="error" startIcon={<Delete />} onClick={onDelete}>
          {t('groups.settings.deleteGroup')}
        </Button>
      )}
      <Button variant="outlined" color={leaveColor} onClick={onLeave}>
        {t('groups.settings.leaveGroup')}
      </Button>
    </Stack>
  );
}

export default function GroupSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useGroupQuery(params.id);
  const deleteGroup = useDeleteGroup(params.id);
  const quitGroup = useQuitGroup(params.id);
  const removeMember = useRemoveMember(params.id);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <SceneContent>
        <Header goBack title={t('groups.settings.title')} />
        <ContentSkeleton variant="card" />
      </SceneContent>
    );
  }

  const group = data.group;
  const isAdmin = data.isAdmin;
  const members = data.members ?? [];
  const isLastMember = isAdmin && members.length === 1;

  const handleDelete = () => {
    setDeleteError(null);
    deleteGroup.mutate(undefined, {
      onSuccess: () => {
        router.push(routes.groups.base.path);
      },
      onError: (err) => {
        const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        if (errorMsg === 'group_has_other_members') {
          setDeleteError(t('groups.settings.cannotDeleteWithMembers'));
        } else {
          setDeleteError(t('common.error'));
        }
      },
    });
  };

  const handleLeave = () => {
    setLeaveError(null);
    quitGroup.mutate(undefined, {
      onSuccess: () => {
        router.push(routes.groups.base.path);
      },
      onError: (err) => {
        const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        if (errorMsg === 'sole_admin_must_promote_or_delete') {
          setLeaveError(t('groups.settings.ownerCannotLeave'));
        } else {
          setLeaveError(t('common.error'));
        }
      },
    });
  };

  const handleKick = (userId: string) => {
    removeMember.mutate(userId);
  };

  const leaveTitle = isLastMember
    ? t('groups.settings.leaveAndDeleteConfirm')
    : t('groups.settings.leaveConfirm');
  const leaveMessage = isLastMember
    ? t('groups.settings.leaveAndDeleteMessage')
    : t('groups.settings.leaveConfirmMessage');
  const leaveConfirmLabel = isLastMember
    ? t('groups.settings.leaveAndDelete')
    : t('groups.settings.leaveGroup');

  return (
    <SceneContent>
      <Header
        goBack
        title={t('groups.settings.title')}
        endSlot={<EditGroupButton isAdmin={isAdmin} groupId={params.id} />}
      />

      <Box sx={{ px: 2, pt: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <SafeAvatar
            src={group.icon}
            fallback={group.name.charAt(0)}
            sx={{ width: 56, height: 56 }}
          />
          <Box>
            <Typography variant="h5" component="h2">
              {group.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.description}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h6" sx={{ mb: 1 }}>
          {t('groups.settings.memberList')} ({members.length})
        </Typography>

        <List>
          {members.map((member: MemberWithCount) => (
            <ListItem
              key={member.id}
              secondaryAction={
                <KickMemberButton
                  canKick={isAdmin && !group.adminIds.includes(member.id)}
                  onKick={() => handleKick(member.id)}
                />
              }
            >
              <ListItemAvatar>
                <SafeAvatar src={member.avatar} fallback={member.name.charAt(0)} />
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                secondary={t('groups.settings.recipeCount', { count: member.recipeCount })}
              />
            </ListItem>
          ))}
        </List>

        <GroupActionButtons
          isAdmin={isAdmin}
          isLastMember={isLastMember}
          onDelete={() => setDeleteOpen(true)}
          onLeave={() => setLeaveOpen(true)}
        />
      </Box>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('groups.settings.deleteConfirm')}
        message={t('groups.settings.deleteConfirmMessage')}
        error={deleteError}
        onConfirm={handleDelete}
        loading={deleteGroup.isPending}
        confirmLabel={t('common.delete')}
      />

      <ConfirmDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title={leaveTitle}
        message={leaveMessage}
        error={leaveError}
        onConfirm={handleLeave}
        loading={quitGroup.isPending}
        confirmLabel={leaveConfirmLabel}
      />
    </SceneContent>
  );
}
