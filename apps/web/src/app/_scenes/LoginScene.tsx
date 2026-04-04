'use client';

import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Divider, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CenteredFullPage } from '../_components/SceneComponents';

export function LoginScene() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual authentication logic
      console.log('Login attempt:', { email, password });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/recipes');
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // TODO: Replace with actual Google OAuth logic
      console.log('Google login initiated');
      // window.location.href = '/api/auth/google';
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/recipes');
    } catch (err) {
      setError('Google login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      // TODO: Replace with actual Apple OAuth logic
      console.log('Apple login initiated');
      // window.location.href = '/api/auth/apple';
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/recipes');
    } catch (err) {
      setError('Apple login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredFullPage>
      <Stack>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Family Recipe
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your Family Recipe account
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
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            fullWidth
            autoComplete="email"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 2 }}>Or</Divider>

      <Stack spacing={1}>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Sign in with Google
        </Button>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<AppleIcon />}
          onClick={handleAppleLogin}
          disabled={loading}
        >
          Sign in with Apple
        </Button>
      </Stack>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <MuiLink
            href="/register"
            sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Sign up
          </MuiLink>
        </Typography>
      </Box>
    </CenteredFullPage>
  );
}
