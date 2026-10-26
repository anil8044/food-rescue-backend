import { useState } from 'react';
import {
  Alert, Button, Paper, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { reservationsApi } from '../../api';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import QueryState from '../../components/QueryState';
import StatusChip from '../../components/StatusChip';
import { formatDateTime } from '../../utils/format';
import FlagProblemDialog from './FlagProblemDialog';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const reservations = useFetch(() => reservationsApi.forRecipient(user.id), [user.id]);
  const [flagging, setFlagging] = useState(null);
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  // Newest first
  const sorted = [...(reservations.data || [])].sort((a, b) => new Date(b.reservedAt) - new Date(a.reservedAt));

  const missedCount = sorted.filter((r) => r.status === 'MISSED').length;

  async function run(action, successMessage) {
    setActionError('');
    try {
      await action();
      setMessage(successMessage);
      reservations.reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  function markCollected(r) {
    run(() => reservationsApi.setStatus(r.id, 'COLLECTED'), `"${r.donationTitle}" marked as collected.`);
  }

  function cancel(r) {
    if (!window.confirm(`Cancel your reservation for "${r.donationTitle}"? It will become available to others.`)) return;
    run(() => reservationsApi.cancel(r.id), 'Reservation cancelled.');
  }

  return (
    <>
      <PageHeader eyebrow="Recipient portal" title="My reservations" subtitle="Track pickups and report any problems." />

      {!reservations.loading && !reservations.error && missedCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have {missedCount} missed collection{missedCount === 1 ? '' : 's'}. Food that is reserved but not collected goes to waste. Repeated misses may lead to your organisation being suspended.
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <QueryState loading={reservations.loading} error={reservations.error}>
        {sorted.length === 0 ? (
          <Alert severity="info">You haven't reserved anything yet. Browse available donations to get started.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Reserved</TableCell>
                  <TableCell>Pickup time</TableCell>
                  <TableCell>Collected</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((r) => {
                  const open = r.status === 'PENDING' || r.status === 'CONFIRMED';
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.donationTitle}</TableCell>
                      <TableCell>{formatDateTime(r.reservedAt)}</TableCell>
                      <TableCell>{formatDateTime(r.scheduledPickupTime)}</TableCell>
                      <TableCell>{formatDateTime(r.collectedAt)}</TableCell>
                      <TableCell>
                        <StatusChip type="reservation" value={r.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" useFlexGap flexWrap="wrap">
                          {open && (
                            <Button size="small" variant="contained" onClick={() => markCollected(r)}>
                              Mark collected
                            </Button>
                          )}
                          {open && (
                            <Button size="small" color="inherit" onClick={() => cancel(r)}>
                              Cancel
                            </Button>
                          )}
                          {r.status !== 'CANCELLED' && r.status !== 'MISSED' && (
                            <Button size="small" color="error" onClick={() => setFlagging(r)}>
                              Report a problem
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryState>

      <FlagProblemDialog
        open={Boolean(flagging)}
        reservation={flagging}
        userId={user.id}
        onClose={() => setFlagging(null)}
        onReported={(text) => {
          setFlagging(null);
          setMessage(text);
        }}
      />

      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage('')} message={message} />
    </>
  );
}

