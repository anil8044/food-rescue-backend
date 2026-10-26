import { useState } from 'react';
import {
  Alert, Box, Button, Grid, Paper, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, donationsApi } from '../../api';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import { categoryLabel } from '../../constants';
import { formatDateTime } from '../../utils/format';
import DonationForm from './DonationForm';

// Donor screen: stats on top, a plain dated donation history on the left, the post form on the right.
export default function DonorHome() {
  const { user } = useAuth();
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  const donations = useFetch(() => donationsApi.byDonor(user.id), [user.id]);
  const stats = useFetch(() => dashboardApi.userStats(user.id), [user.id]);

  // Newest first
  const sorted = [...(donations.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const byStatus = stats.data?.donationsByStatus || {};

  function refresh() {
    donations.reload();
    stats.reload();
  }

  async function cancelDonation(donation) {
    if (!window.confirm(`Cancel "${donation.title}"? Recipients will no longer see it.`)) return;
    setActionError('');
    try {
      await donationsApi.setStatus(donation.id, 'CANCELLED');
      setMessage(`"${donation.title}" was cancelled.`);
      refresh();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Donor portal"
        title="Your Donation Hub"
        subtitle="Post surplus food and track what you've shared with the community."
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <QueryState loading={stats.loading} error={stats.error}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatCard label="Active donations" value={byStatus.AVAILABLE} color="#2b8a57" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard label="Reserved donations" value={byStatus.RESERVED} color="#c75d1f" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard label="Collected donations" value={byStatus.COLLECTED} color="#2f6fb5" />
          </Grid>
        </Grid>
      </QueryState>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} lg={7}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Donation history
          </Typography>
          <QueryState loading={donations.loading} error={donations.error}>
            {sorted.length === 0 ? (
              <Alert severity="info">You haven't posted any donations yet. Use the form to post your first one.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Collect by</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sorted.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {d.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {categoryLabel(d.category)} · posted {formatDateTime(d.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {d.quantity} {d.quantityUnit}
                        </TableCell>
                        <TableCell>{formatDateTime(d.collectionDeadline)}</TableCell>
                        <TableCell>
                          <StatusChip type="donation" value={d.status} />
                        </TableCell>
                        <TableCell align="right">
                          {d.status === 'AVAILABLE' && (
                            <Button size="small" color="error" onClick={() => cancelDonation(d)}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </QueryState>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Box component={Paper} sx={{ p: 3 }}>
            <DonationForm
              onPosted={(text) => {
                setMessage(text);
                refresh();
              }}
            />
          </Box>
        </Grid>
      </Grid>

      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage('')} message={message} />
    </>
  );
}
