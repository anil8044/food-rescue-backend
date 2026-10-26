import { useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Container, Link, Stack,
  TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { homePathFor } from '../../utils/roles';

const EMPTY = { fullName: '', organisationName: '', email: '', password: '', phoneNumber: '', address: '' };

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('DONOR');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.fullName.trim() || !form.organisationName.trim() || !form.email.trim()) {
      setError('Please fill in your name, organisation and email.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // Only DONOR and RECIPIENT_ORG can be chosen here. ADMIN accounts are never created from this screen.
    const payload = {
      fullName: form.fullName.trim(),
      organisationName: form.organisationName.trim(),
      email: form.email.trim(),
      password: form.password,
      role,
    };
    if (form.phoneNumber.trim()) payload.phoneNumber = form.phoneNumber.trim();
    if (form.address.trim()) payload.address = form.address.trim();

    setSubmitting(true);
    try {
      const created = await register(payload);
      navigate(homePathFor(created.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" align="center" sx={{ mb: 3 }}>
          Create an account
        </Typography>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    I am registering as
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    color="primary"
                    value={role}
                    onChange={(_, value) => value && setRole(value)}
                  >
                    <ToggleButton value="DONOR">Donor (business or farm)</ToggleButton>
                    <ToggleButton value="RECIPIENT_ORG">Recipient organisation</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {role === 'RECIPIENT_ORG' && (
                  <Alert severity="info">
                    New recipient organisations are checked by an administrator before they can reserve donations.
                  </Alert>
                )}

                <TextField label="Your full name" value={form.fullName} onChange={update('fullName')} fullWidth />
                <TextField
                  label={role === 'DONOR' ? 'Business or farm name' : 'Organisation name'}
                  value={form.organisationName}
                  onChange={update('organisationName')}
                  fullWidth
                />
                <TextField label="Email" type="email" value={form.email} onChange={update('email')} autoComplete="email" fullWidth />
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={update('password')}
                  helperText="At least 8 characters"
                  autoComplete="new-password"
                  fullWidth
                />
                <TextField label="Phone (optional)" value={form.phoneNumber} onChange={update('phoneNumber')} fullWidth />
                <TextField label="Address (optional)" value={form.address} onChange={update('address')} fullWidth />

                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Create account'}
                </Button>
                <Typography variant="body2" align="center">
                  Already registered?{' '}
                  <Link component={RouterLink} to="/login">
                    Log in
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
