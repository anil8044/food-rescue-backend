import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const from = location.pathname + location.search + location.hash
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Typography component={Link} to="/" variant="h6" sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, flexGrow: 1 }}>Food Rescue</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
<Button color="inherit" component={Link} to="/donations">Browse donations</Button>
{user ? <>
              <Typography variant="body2">{user.fullName} · {user.role}</Typography>
              <Button color="inherit" onClick={logout}>Log out</Button>
            </> : <>
              <Button color="inherit" sx={{ boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.25)' }} component={Link} to="/login" state={{ from }}>Log in</Button>
              <Button color="inherit" sx={{ boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.25)' }} component={Link} to="/register" state={{ from }}>Register</Button>
            </>}
          </Stack>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flex: 1 }}><Outlet /></Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">Food Rescue · Connecting local communities</Typography>
          <Box component="nav" aria-label="Footer links" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 3, rowGap: 1.5, mt: 2 }}>
            {['Terms', 'Privacy', 'Food safety', 'Community', 'Help', 'Contact'].map((label) => (
              <Typography key={label} component="span" role="link" aria-disabled="true" variant="body2" sx={{ color: 'text.secondary', cursor: 'default' }}>
                {label}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}





