import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { AppBar, Box, Button, Card, CardContent, Container, Grid, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GrassIcon from '@mui/icons-material/Grass';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useAuth } from '../../context/AuthContext';
import { homePathFor } from '../../utils/roles';
import { COLORS } from '../../theme';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'how', label: 'How it works' },
  { id: 'who', label: 'Who it is for' },
  { id: 'safety', label: 'Food safety' },
];

// Tracks which section is on screen so the menu can highlight it while scrolling.
function useActiveSection(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let current = '';
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ids]);
  return active;
}

const IDS = NAV.map((n) => n.id);

// Shows a photo from /images/<file> if one has been added; otherwise a green placeholder panel.
function ImageSlot({ file, alt, icon: Icon, height }) {
  const [failed, setFailed] = useState(false);
  return (
    <Box
      sx={{
        height,
        borderRadius: 4,
        overflow: 'hidden',
        border: '4px solid #fff',
        background: 'linear-gradient(135deg, #bfe3cd 0%, #f6c9a6 100%)',
        boxShadow: '0 12px 32px rgba(31,42,36,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {failed ? (
        <Icon sx={{ fontSize: 96, color: 'rgba(255,255,255,0.85)' }} />
      ) : (
        <Box
          component="img"
          src={`/images/${file}`}
          alt={alt}
          onError={() => setFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </Box>
  );
}

function Section({ id, eyebrow, title, bg, accent = COLORS.primary, children }) {
  return (
    <Box id={id} sx={{ py: { xs: 6, md: 9 }, scrollMarginTop: 64, background: bg }}>
      <Container maxWidth="lg">
        <Typography sx={{ color: accent, fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1.5, textTransform: 'uppercase', mb: 1 }}>
          {eyebrow}
        </Typography>
        <Typography variant="h4" sx={{ mb: 4, maxWidth: 720 }}>
          {title}
        </Typography>
        {children}
      </Container>
    </Box>
  );
}

function InfoCard({ icon: Icon, title, text, tint = COLORS.mint, color = COLORS.primary }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        border: 'none',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 28px rgba(31,42,36,0.12)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: 3, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Icon sx={{ color, fontSize: 28 }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{text}</Typography>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const active = useActiveSection(IDS);
  const [menuAnchor, setMenuAnchor] = useState(null);
  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  return (
    <Box>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.92)',
          color: COLORS.foreground,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundImage: 'none',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 68 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: { xs: 1, md: 0 }, mr: 3, minWidth: 0 }}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                }}
              >
                <GrassIcon sx={{ color: '#fff' }} />
              </Box>
              <Typography noWrap sx={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem' }}>Food Rescue</Typography>
            </Stack>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
              {NAV.map((n) => (
                <Button
                  key={n.id}
                  href={`#${n.id}`}
                  sx={{
                    color: active === n.id ? COLORS.primaryDark : COLORS.muted,
                    background: active === n.id ? COLORS.mint : 'transparent',
                    '&:hover': { background: COLORS.mint },
                  }}
                >
                  {n.label}
                </Button>
              ))}
            </Box>
            <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} aria-label="Menu" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              {NAV.map((n) => (
                <MenuItem key={n.id} component="a" href={`#${n.id}`} selected={active === n.id} onClick={() => setMenuAnchor(null)}>
                  {n.label}
                </MenuItem>
              ))}
            </Menu>
            <Button component={RouterLink} to="/login" color="inherit">
              Log in
            </Button>
            <Button component={RouterLink} to="/register" variant="contained">
              Register
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fff6ea 0%, #fbf8f3 45%, #e6f3ea 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(217,105,42,0.14)' }} />
        <Box sx={{ position: 'absolute', bottom: -90, left: -70, width: 260, height: 260, borderRadius: '50%', background: 'rgba(43,138,87,0.12)' }} />
      <Container maxWidth="lg" sx={{ position: 'relative', pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 9 } }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography sx={{ color: COLORS.accent, fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
              Local food rescue, South Australia
            </Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: '2.4rem', md: '3.2rem' }, lineHeight: 1.1, mb: 2.5 }}>
              Good food belongs on plates, not in bins.
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.1rem', mb: 4, maxWidth: 520 }}>
              Food Rescue connects local donors with surplus food to community organisations that can use it, quickly and
              safely.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button component={RouterLink} to="/register" variant="contained" size="large">
                Get started
              </Button>
              <Button component={RouterLink} to="/login" variant="outlined" size="large" color="inherit">
                Log in
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <ImageSlot file="hero.jpg" alt="Fresh food ready for collection" icon={RestaurantIcon} height={{ xs: 260, md: 400 }} />
          </Grid>
        </Grid>
      </Container>
      </Box>

      <Section id="about" bg="#ffffff" accent={COLORS.accent} eyebrow="About" title="A simple way to move surplus food to the people who need it">
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={5}>
            <ImageSlot file="about.jpg" alt="Volunteers sorting food" icon={VolunteerActivismIcon} height={{ xs: 220, md: 320 }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography color="text.secondary" sx={{ fontSize: '1.05rem', mb: 2 }}>
              Cafes, bakeries and grocers often have good food left at the end of the day. Community kitchens and charities
              often need it. The hard part is connecting the two in time.
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.05rem', mb: 2 }}>
              This platform was built as a university project for the South Australian Food Rescue Network. Donors list what
              they have, approved organisations reserve it and collect it, and administrators keep an eye on food safety.
            </Typography>
          </Grid>
        </Grid>
      </Section>

      <Section id="how" bg={COLORS.mint} eyebrow="How it works" title="From surplus to served in three steps">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InfoCard icon={RestaurantIcon} tint={COLORS.peach} color={COLORS.accent} title="1. Donors list food" text="Add what you have, how much, and when it must be collected by. It appears for approved organisations straight away." />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard icon={EventAvailableIcon} tint={COLORS.sky} color="#2f6fb5" title="2. Organisations reserve" text="Approved recipients browse what is available, reserve an item and choose a pickup time. The donor is notified." />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard icon={NotificationsActiveIcon} tint={COLORS.butter} color="#a87a00" title="3. Food is collected" text="Once it is collected the donation is marked complete. Anything not collected in time expires automatically." />
          </Grid>
        </Grid>
      </Section>

      <Section id="who" bg={COLORS.peach} accent={COLORS.accent} eyebrow="Who it is for" title="Built for three groups">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InfoCard icon={RestaurantIcon} tint={COLORS.butter} color="#a87a00" title="Donors" text="Food businesses with surplus stock. List donations in under a minute and see when they are reserved and collected." />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard icon={VolunteerActivismIcon} tint={COLORS.mint} color={COLORS.primary} title="Recipient organisations" text="Charities and community kitchens. Browse available food, reserve it and keep track of your pickups." />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard icon={VerifiedUserIcon} tint={COLORS.sky} color="#2f6fb5" title="Administrators" text="Approve recipient organisations, follow up food-safety reports and produce incident reports for a chosen period." />
          </Grid>
        </Grid>
      </Section>

      <Section id="safety" bg={COLORS.sky} accent="#2f6fb5" eyebrow="Food safety" title="Problems are reported, followed up and recorded">
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={6}>
            <InfoCard
              icon={ReportProblemIcon}
              tint={COLORS.peach}
              color={COLORS.accent}
              title="Report a problem"
              text="An organisation that reserved a donation can report an issue as Low, Medium or High, with notes. Administrators are alerted straight away."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard
              icon={VerifiedUserIcon}
              tint={COLORS.mint}
              color={COLORS.primary}
              title="A clear record"
              text="Each report is reviewed, noted and resolved with a dated outcome, and can be summarised in a report for any period."
            />
          </Grid>
        </Grid>
      </Section>

      <Box sx={{ py: 8, textAlign: 'center', color: '#fff', background: 'linear-gradient(135deg, #1d6a41 0%, #2b8a57 55%, #3aa06a 100%)' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ mb: 2 }}>
            Ready to rescue some food?
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ background: '#fff', color: COLORS.primaryDark, boxShadow: 'none', '&:hover': { background: COLORS.butter } }}>
              Register
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" size="large" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.7)', borderWidth: 1.5, '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.1)' } }}>
              Log in
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: 3, background: '#1f2a24' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Food Rescue Community Platform. University of Adelaide COMP 5800 industry project, Group 262, for the South
            Australian Food Rescue Network.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
