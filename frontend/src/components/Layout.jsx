import { AppBar, Avatar, Box, Button, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import GrassIcon from '@mui/icons-material/Grass';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS, homePathFor, roleLabel } from '../utils/roles';
import { COLORS } from '../theme';
import NotificationBell from './NotificationBell';

function initials(user) {
  const name = user.organisationName || user.fullName || '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user.role] || [];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${COLORS.border}`,
          color: COLORS.foreground,
          backgroundImage: 'none',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 68, flexWrap: 'wrap' }}>
            <Box
              component={NavLink}
              to={homePathFor(user.role)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit', mr: 1 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  boxShadow: '0 4px 14px rgba(43,138,87,0.30)',
                }}
              >
                <GrassIcon sx={{ color: '#fff' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.15rem', lineHeight: 1 }}>
                  Food Rescue
                </Typography>
                <Typography sx={{ color: COLORS.primary, fontSize: '0.7rem', lineHeight: 1.4 }}>Community Platform</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1, flexWrap: 'wrap' }}>
              {items.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  end
                  sx={{
                    color: COLORS.muted,
                    border: '1px solid transparent',
                    px: 2,
                    '&.active': {
                      color: COLORS.primary,
                      border: '1px solid rgba(43,138,87,0.30)',
                      background: COLORS.mint,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <NotificationBell />
            <Tooltip title={`${user.fullName} (${roleLabel(user.role)})`}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 3,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#fff',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                }}
              >
                {initials(user)}
              </Avatar>
            </Tooltip>
            <Tooltip title="Log out">
              <IconButton onClick={handleLogout} aria-label="Log out">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
