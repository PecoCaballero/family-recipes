'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scene, SceneContent } from '../_components/SceneComponents';
import { SettingOption } from '../_components/SettingOption';
import { RecipeStats } from '../_components/RecipeStats';
import { AvatarUpload } from '../_components/AvatarUpload';
import { EditProfileDialog } from '../_components/EditProfileDialog';
import { ChangePasswordDialog } from '../_components/ChangePasswordDialog';
import { DeleteAccountDialog } from '../_components/DeleteAccountDialog';
import { useAuth } from '../_providers/AuthContext';
import { useTheme } from '../_providers/themeContext';
import type { ThemeMode } from '../_providers/themeContext';
import {
  useUserSettingsUpdate,
  useProfileUpdate,
  usePasswordChange,
  useAvatarUpload,
  useAvatarRemove,
  useAccountDeletion,
} from '../_hooks/user';

export function AccountScene() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { storedMode, setMode } = useTheme();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { user, logout, setUser } = useAuth();
  const { mutateAsync: updateSetting, isPending: savingSetting } = useUserSettingsUpdate();
  const profileUpdate = useProfileUpdate();
  const passwordChange = usePasswordChange();
  const avatarUpload = useAvatarUpload();
  const avatarRemove = useAvatarRemove();
  const accountDeletion = useAccountDeletion();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const [settings, setSettings] = useState({
    language: user?.settings.language ?? i18n.language ?? 'en',
    privacyLevel: user?.settings.privacyLevel ?? 'private',
    notifications: user?.settings.notifications ?? true,
  });

  useEffect(() => {
    const storedLanguage =
      typeof window !== 'undefined' ? sessionStorage.getItem('language') : null;
    if (storedLanguage && storedLanguage !== settings.language) {
      i18n.changeLanguage(storedLanguage);
      setSettings((prev) => ({ ...prev, language: storedLanguage }));
    }
  }, [i18n, settings.language]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleSettingChange = async (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === 'language' && typeof value === 'string') {
      i18n.changeLanguage(value);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('language', value);
      }
    }

    await updateSetting({ key, value });

    // Keep user in context synced so re-login picks up persisted settings
    if (user) {
      setUser({
        ...user,
        settings: {
          ...user.settings,
          [key]: value,
        },
      });
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const result = await avatarUpload.mutateAsync(file);
    if (user) {
      setUser({ ...user, avatar: result.avatarUrl });
    }
  };

  const handleAvatarRemove = async () => {
    await avatarRemove.mutateAsync();
    if (user) {
      setUser({ ...user, avatar: undefined });
    }
  };

  const handleProfileUpdate = async (name: string, email: string) => {
    const updated = await profileUpdate.mutateAsync({ name, email });
    setUser(updated);
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    await passwordChange.mutateAsync({ currentPassword, newPassword });
  };

  const handleAccountDeletion = async () => {
    await accountDeletion.mutateAsync();
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('language');
    router.push('/login');
  };

  const handleThemeModeChange = async (value: string) => {
    const mode = value as ThemeMode;
    setMode(mode);
    await updateSetting({ key: 'theme', value });
    if (user) {
      setUser({
        ...user,
        settings: { ...user.settings, theme: mode },
      });
    }
  };

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' },
    { label: 'Português', value: 'pt' },
  ];

  const themeOptions = [
    { label: t('account.themeLight'), value: 'light' },
    { label: t('account.themeDark'), value: 'dark' },
    { label: t('account.themeAuto'), value: 'auto' },
  ];

  const privacyOptions = [
    { label: t('account.privacyPrivate'), value: 'private' },
    { label: t('account.privacyFamily'), value: 'family' },
    { label: t('account.privacyPublic'), value: 'public' },
  ];

  return (
    <Scene>
      <SceneContent>
        <Stack spacing={2} sx={{ padding: 2, paddingTop: 6 }}>
          <Stack alignItems="center" spacing={1}>
            <AvatarUpload
              src={user?.avatar}
              fallback={
                user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : <AccountCircle sx={{ fontSize: 40 }} />
              }
              uploadLabel={t('account.uploadAvatar')}
              deleteLabel={t('account.deleteAvatar')}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />
            <Stack alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {user?.name ?? t('account.unknownUser')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email ?? ''}
              </Typography>
            </Stack>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditProfileOpen(true)}
            >
              {t('account.editProfile')}
            </Button>
          </Stack>

          <RecipeStats
            recipesSaved={user?.recipesSaved.length ?? 0}
            recipesShared={user?.recipesSharedByOthers ?? 0}
          />

          <SettingOption
            label={t('account.language')}
            description={t('account.languageDescription')}
            type="select"
            value={settings.language}
            onChange={(value) => handleSettingChange('language', value)}
            options={languageOptions}
          />

          <Divider />
          <SettingOption
            label={t('account.theme')}
            description={t('account.themeDescription')}
            type="select"
            value={storedMode}
            onChange={(value) => handleThemeModeChange(value as string)}
            options={themeOptions}
          />

          <Divider />
          <SettingOption
            label={t('account.privacy')}
            description={t('account.privacyDescription')}
            type="select"
            value={settings.privacyLevel}
            onChange={(value) => handleSettingChange('privacyLevel', value)}
            options={privacyOptions}
          />
          <Divider />

          <SettingOption
            label={t('account.notifications')}
            description={t('account.notificationsDescription')}
            type="toggle"
            value={settings.notifications}
            onChange={(value) => handleSettingChange('notifications', value)}
          />

          <Divider />

          <Button
            variant="outlined"
            fullWidth
            startIcon={<LockIcon />}
            onClick={() => setChangePasswordOpen(true)}
          >
            {t('account.changePassword')}
          </Button>

          <Button
            variant="text"
            color="error"
            size="large"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            disabled={logoutLoading}
            sx={{ fontWeight: 'bold' }}
          >
            {logoutLoading ? t('common.loading') : t('account.logoutButton')}
          </Button>

          <Button
            variant="text"
            color="error"
            fullWidth
            startIcon={<DeleteForeverIcon />}
            onClick={() => setDeleteAccountOpen(true)}
            sx={{ mt: -1 }}
          >
            {t('account.deleteAccount')}
          </Button>
        </Stack>

        <EditProfileDialog
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          title={t('account.editProfileTitle')}
          nameLabel={t('account.nameLabel')}
          emailLabel={t('account.emailLabel')}
          cancelLabel={t('common.cancel')}
          saveLabel={t('common.save')}
          fieldRequiredError={t('account.fieldRequiredError')}
          invalidEmailError={t('account.invalidEmailError')}
          currentName={user?.name ?? ''}
          currentEmail={user?.email ?? ''}
          onSave={handleProfileUpdate}
          saving={profileUpdate.isPending}
          error={profileUpdate.error ? t('common.error') : null}
        />

        <ChangePasswordDialog
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
          title={t('account.changePasswordTitle')}
          currentPasswordLabel={t('account.currentPasswordLabel')}
          newPasswordLabel={t('account.newPasswordLabel')}
          confirmPasswordLabel={t('account.confirmPasswordLabel')}
          cancelLabel={t('common.cancel')}
          saveLabel={t('common.save')}
          passwordTooShortError={t('account.passwordTooShortError')}
          passwordsMismatchError={t('account.passwordsMismatchError')}
          onSave={handlePasswordChange}
          saving={passwordChange.isPending}
          error={passwordChange.error ? t('common.error') : null}
        />

        <DeleteAccountDialog
          open={deleteAccountOpen}
          onClose={() => setDeleteAccountOpen(false)}
          title={t('account.deleteAccountTitle')}
          warningText={t('account.deleteWarning')}
          confirmPrompt={t('account.deleteConfirmPrompt')}
          cancelLabel={t('common.cancel')}
          deleteLabel={t('account.deleteLabel')}
          email={user?.email ?? ''}
          onDelete={handleAccountDeletion}
          deleting={accountDeletion.isPending}
          error={accountDeletion.error ? t('common.error') : null}
        />
      </SceneContent>
    </Scene>
  );
}
