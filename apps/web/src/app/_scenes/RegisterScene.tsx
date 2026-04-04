'use client';

import { Box, Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredFullPage>
      <Stack>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join Family Recipe and start sharing
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
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="given-name"
          />

          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="family-name"
          />

          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            fullWidth
            autoComplete="email"
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="new-password"
          />

          <TextField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="new-password"
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </Stack>
      </form>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink
            href="/login"
            sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Sign in
          </MuiLink>
        </Typography>
      </Box>
    </CenteredFullPage>
  );
}
