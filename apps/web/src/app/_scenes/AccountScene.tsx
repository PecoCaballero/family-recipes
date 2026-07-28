'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import { Button, Divider, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scene, SceneContent } from '../_components/SceneComponents';
import { SettingOption } from '../_components/SettingOption';
import { RecipeStats } from '../_components/RecipeStats';
import { UserInfo } from '../_components/UserInfo';
import { useAuth } from '../_providers/AuthContext';
import { useTheme } from '../_providers/themeContext';
import type { ThemeMode } from '../_providers/themeContext';
import { useUserSettingsUpdate } from '../_hooks/user';

export function AccountScene() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { storedMode, setMode } = useTheme();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { user, logout } = useAuth();
  const { mutateAsync: updateSetting, isPending: savingSetting } = useUserSettingsUpdate();

  const [settings, setSettings] = useState({
    language: i18n.language || 'en',
    privacyLevel: 'private',
    notifications: true,
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
          <UserInfo name={user?.name ?? 'User'} email={user?.email ?? ''} avatar={user?.avatar} />

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
            onChange={(value) => setMode(value as ThemeMode)}
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
        </Stack>
      </SceneContent>
    </Scene>
  );
}
