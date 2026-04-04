'use client';

import { Box, Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CenteredFullPage } from '../_components/SceneComponents';

export function RegisterScene() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual registration logic
      console.log('Register attempt:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/recipes');
    } catch (err) {
      setError(t('register.registerFailed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredFullPage>
      <Stack>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {t('register.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('register.subtitle')}
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && (
            <Box
              sx={{
                p: 2,
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          <TextField
            label={t('register.nameLabel')}
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="given-name"
          />

          <TextField
            label={t('register.nameLabel')}
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="family-name"
          />

          <TextField
            label={t('register.emailLabel')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('register.emailPlaceholder')}
            required
            fullWidth
            autoComplete="email"
          />

          <TextField
            label={t('register.passwordLabel')}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="new-password"
          />

          <TextField
            label={t('register.confirmPasswordLabel')}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="new-password"
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? t('register.signingUp') : t('register.signUpButton')}
          </Button>
        </Stack>
      </form>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('register.hasAccount')}{' '}
          <MuiLink
            href="/login"
            sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' }}
          >
            {t('register.signInLink')}
          </MuiLink>
        </Typography>
      </Box>
    </CenteredFullPage>
  );
}
