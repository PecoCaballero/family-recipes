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

type TpUserData = {
  name: string;
  email: string;
  avatar?: string;
  recipesSaved: number;
  recipesSharedByOthers: number;
};

type TpAccountSettings = {
  language: string;
  theme: string;
  privacyLevel: string;
  notifications: boolean;
};

export function AccountScene() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Mock user data - TODO: Replace with actual API call
  const [userData] = useState<TpUserData>({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: undefined,
    recipesSaved: 24,
    recipesSharedByOthers: 12,
  });

  const [settings, setSettings] = useState<TpAccountSettings>({
    language: i18n.language || 'en',
    theme: 'light',
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
    setLoading(true);
    try {
      // TODO: Replace with actual logout logic
      console.log('Logging out');
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof TpAccountSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    console.log(`Setting ${key} changed to:`, value);

    // Handle language change
    if (key === 'language' && typeof value === 'string') {
      i18n.changeLanguage(value);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('language', value);
      }
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
          <UserInfo name={userData.name} email={userData.email} avatar={userData.avatar} />

          <RecipeStats
            recipesSaved={userData.recipesSaved}
            recipesShared={userData.recipesSharedByOthers}
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
            value={settings.theme}
            onChange={(value) => handleSettingChange('theme', value)}
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
            disabled={loading}
            sx={{ fontWeight: 'bold' }}
          >
            {loading ? t('common.loading') : t('account.logoutButton')}
          </Button>
        </Stack>
      </SceneContent>
    </Scene>
  );
}
