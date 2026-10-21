import { AppBar, Avatar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import BrandMark from '../components/BrandMark'
import { COLORS } from '../theme'

const navStyle = {
  color: COLORS.muted, border: '1px solid transparent',
  '&.active': { color: COLORS.primary, borderColor: 'rgba(43,138,87,0.3)', bgcolor: COLORS.mint },
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const from = location.pathname + location.search + location.hash
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.92)', color: 'text.primary', backdropFilter: 'blur(20px)', border: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1.5, gap: 2, flexWrap: 'wrap', minHeight: 68 }}>
            <Stack component={Link} to="/" direction="row" spacing={1.5} sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit', mr: 1 }}>
              <BrandMark />
              <Box>
                <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', lineHeight: 1.1 }}>Food Rescue</Typography>
                <Typography sx={{ fontSize: '.7rem', color: 'primary.main' }}>Community Platform</Typography>
              </Box>
            </Stack>
            <Stack component="nav" aria-label="Main navigation" direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap', flexGrow: 1 }}>
              <Button component={NavLink} to="/" end sx={navStyle}>Home</Button>
              <Button component={NavLink} to="/donations" sx={navStyle}>Browse donations</Button>
              {user?.role === 'RECIPIENT_ORG' && <Button component={NavLink} to="/recipient/reservations" sx={navStyle}>My reservations</Button>}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {user ? <>
                <Avatar aria-hidden="true" sx={{ width: 36, height: 36, borderRadius: 3, bgcolor: 'primary.main', fontSize: '.85rem' }}>
                  {user.fullName.split(' ').filter(Boolean).slice(0, 2).map((name) => name[0]).join('')}
                </Avatar>
                <Typography variant="body2">{user.fullName} · {user.role}</Typography>
                <Button onClick={logout}>Log out</Button>
              </> : <>
                <Button variant="outlined" component={Link} to="/login" state={{ from }} sx={{ boxShadow: '0 0 0 1px rgba(255,255,255,.25)' }}>Log in</Button>
                <Button variant="contained" component={Link} to="/register" state={{ from }}>Register</Button>
              </>}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flex: 1 }}><Outlet /></Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 4, bgcolor: 'rgba(255,255,255,.65)' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">Food Rescue · Connecting local communities</Typography>
          <Box component="nav" aria-label="Footer links" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 3, rowGap: 1.5, mt: 2 }}>
            {['Terms', 'Privacy', 'Food safety', 'Community', 'Help', 'Contact'].map((label) => (
              <Typography key={label} component="span" role="link" aria-disabled="true" variant="body2" sx={{ color: 'text.secondary', cursor: 'default' }}>{label}</Typography>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

