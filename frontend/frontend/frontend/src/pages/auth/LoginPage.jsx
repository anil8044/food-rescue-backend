import { useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Container, Link, Stack, TextField, Typography } from '@mui/material';
import GrassIcon from '@mui/icons-material/Grass';
import { useAuth } from '../../context/AuthContext';
import { homePathFor } from '../../utils/roles';
import { COLORS } from '../../theme';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const loggedIn = await login(email.trim(), password);
      const from = location.state?.from?.pathname;
      navigate(from || homePathFor(loggedIn.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
              boxShadow: '0 4px 14px rgba(43,138,87,0.35)',
            }}
          >
            <GrassIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" component="h1">
            Food Rescue
          </Typography>
          <Typography color="text.secondary">Share surplus food with the community</Typography>
        </Stack>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <Typography variant="h5">Log in</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                  {submitting ? 'Logging in...' : 'Log in'}
                </Button>
                <Typography variant="body2" align="center">
                  New here?{' '}
                  <Link component={RouterLink} to="/register">
                    Create an account
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
