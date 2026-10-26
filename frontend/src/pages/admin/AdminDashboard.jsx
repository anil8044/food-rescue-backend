import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { dashboardApi } from '../../api';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import BarList from '../../components/BarList';
import { STATUS_COLORS, categoryLabel, humanize } from '../../constants';

function toRows(map, colors, labeller = humanize) {
  return Object.entries(map || {}).map(([key, value]) => ({
    label: labeller(key),
    value,
    color: colors?.[key],
  }));
}

export default function AdminDashboard() {
  const stats = useFetch(() => dashboardApi.stats(), []);
  const s = stats.data;

  return (
    <>
      <PageHeader eyebrow="Admin console" title="Platform overview" subtitle="Donation activity and food-safety follow-ups at a glance." />

      <QueryState loading={stats.loading} error={stats.error}>
        {s && (
          <>
            {s.unresolvedIncidents > 0 && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                action={
                  <Button component={RouterLink} to="/admin/incidents" color="inherit" size="small">
                    Review
                  </Button>
                }
              >
                {s.unresolvedIncidents} food-safety incident{s.unresolvedIncidents === 1 ? '' : 's'} need
                {s.unresolvedIncidents === 1 ? 's' : ''} follow-up.
              </Alert>
            )}
            {s.pendingVerifications > 0 && (
              <Alert
                severity="warning"
                sx={{ mb: 3 }}
                action={
                  <Button component={RouterLink} to="/admin/recipients" color="inherit" size="small">
                    Review
                  </Button>
                }
              >
                {s.pendingVerifications} recipient organisation{s.pendingVerifications === 1 ? '' : 's'} waiting for approval.
              </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} md={3}>
                <StatCard label="Total donations" value={s.totalDonations} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Active donations" value={s.activeDonations} color="#2b8a57" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Reservations" value={s.totalReservations} sub={`${s.completedReservations} completed`} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Verified recipients" value={s.verifiedRecipients} sub={`${s.pendingVerifications} pending`} color="#2f6fb5" />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6} md={3}>
                <StatCard label="Open incidents" value={s.unresolvedIncidents} color="#c93c3c" highlight={s.unresolvedIncidents > 0} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Incidents reported" value={s.totalIncidents} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Users" value={s.totalUsers} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Unread notifications" value={s.unreadNotifications} color="#c75d1f" />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Donations by status
                    </Typography>
                    <BarList rows={toRows(s.donationsByStatus, STATUS_COLORS.donation)} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Donations by category
                    </Typography>
                    <BarList rows={toRows(s.donationsByCategory, null, categoryLabel)} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Incidents by severity
                    </Typography>
                    <BarList rows={toRows(s.incidentsBySeverity, STATUS_COLORS.severity)} emptyText="No incidents reported." />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Incidents by status
                    </Typography>
                    <BarList rows={toRows(s.incidentsByStatus, STATUS_COLORS.incident)} emptyText="No incidents reported." />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </QueryState>
    </>
  );
}
