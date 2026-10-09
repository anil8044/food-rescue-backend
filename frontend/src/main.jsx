import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Box,
  Container,
  CssBaseline,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import DonationForm from './DonationForm';
import DonationList from './DonationList';
import DonorStats from './DonorStats';

const theme = createTheme({
  palette: {
    primary: { main: '#236548' },
    background: { default: '#f3f5f3' },
  },
  shape: { borderRadius: 10 },
});

function DonorPortal() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Reload the list after a donation is successfully posted.
  function handleDonationCreated() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <>
      <Box
        component="header"
        sx={{ bgcolor: '#173d2e', color: 'white', p: 2 }}
      >
        <Container maxWidth="lg">
          <Typography fontWeight={700}>
            Food Rescue · Donor portal
          </Typography>
        </Container>
      </Box>

      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          component="h1"
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Your Donation Hub
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Post surplus food and track your donations.
        </Typography>

        <DonorStats donorId={1} refreshKey={refreshKey} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(0, 1fr) minmax(0, 1fr)',
            },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <DonationList
              donorId={1}
              refreshKey={refreshKey}
              onChanged={handleDonationCreated}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              component="h2"
              variant="h5"
              fontWeight={700}
              sx={{ mb: 3 }}
            >
              Post a donation
            </Typography>

            <DonationForm
              donorId={1}
              onCreated={handleDonationCreated}
            />
          </Paper>
        </Box>
      </Container>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DonorPortal />
    </ThemeProvider>
  </React.StrictMode>
);