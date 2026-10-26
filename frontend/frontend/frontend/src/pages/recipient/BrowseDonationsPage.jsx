import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, MenuItem, Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { donationsApi, reservationsApi } from '../../api';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import QueryState from '../../components/QueryState';
import StatusChip from '../../components/StatusChip';
import { CATEGORIES, categoryLabel } from '../../constants';
import { formatDateTime, toIsoInstant } from '../../utils/format';
import { COLORS } from '../../theme';

export default function BrowseDonationsPage() {
  const { user, refreshUser } = useAuth();
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('deadline');
  const [selected, setSelected] = useState(null); // the donation being reserved
  const [pickup, setPickup] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const donations = useFetch(() => donationsApi.available(), []);
  const approved = user.verificationStatus === 'APPROVED';

  // Pick up any change an administrator made to this organisation's approval.
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = (donations.data || [])
    .filter((d) => category === 'ALL' || d.category === category)
    .sort((a, b) =>
      sort === 'quantity'
        ? b.quantity - a.quantity
        : new Date(a.collectionDeadline) - new Date(b.collectionDeadline)
    );

  function openReserve(donation) {
    setSelected(donation);
    setPickup('');
    setDialogError('');
  }

  async function confirmReserve() {
    if (!pickup) {
      setDialogError('Please choose a pickup time.');
      return;
    }
    const when = new Date(pickup);
    if (when <= new Date()) {
      setDialogError('The pickup time must be in the future.');
      return;
    }
    if (when > new Date(selected.collectionDeadline)) {
      setDialogError(`Pickup must be by ${formatDateTime(selected.collectionDeadline)}.`);
      return;
    }

    setSubmitting(true);
    setDialogError('');
    try {
      await reservationsApi.create(user.id, {
        donationId: selected.id,
        scheduledPickupTime: toIsoInstant(pickup),
      });
      setMessage(`"${selected.title}" is reserved. You'll find it under My reservations.`);
      setSelected(null);
      donations.reload();
    } catch (err) {
      setDialogError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Browse & reserve"
        title="Available food"
        subtitle="Reserve surplus food before it expires."
        action={
          <TextField select size="small" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="deadline">Collect-by time (soonest)</MenuItem>
            <MenuItem value="quantity">Quantity (largest)</MenuItem>
          </TextField>
        }
      />

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
        {[{ value: 'ALL', label: 'All' }, ...CATEGORIES].map((c) => (
          <Chip
            key={c.value}
            label={c.label}
            clickable
            color={category === c.value ? 'primary' : 'default'}
            variant={category === c.value ? 'filled' : 'outlined'}
            onClick={() => setCategory(c.value)}
          />
        ))}
      </Stack>

      {!approved && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <span>Your organisation's status is</span>
            <StatusChip type="verification" value={user.verificationStatus || 'PENDING'} />
            <span>You can browse now, but you can only reserve once an administrator approves it.</span>
          </Stack>
        </Alert>
      )}

      <QueryState loading={donations.loading} error={donations.error}>
        {visible.length === 0 ? (
          <Alert severity="info">No donations are available right now. Check back soon.</Alert>
        ) : (
          <Grid container spacing={2.5}>
            {visible.map((d) => (
              <Grid item xs={12} sm={6} lg={4} key={d.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ color: COLORS.primary, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                    >
                      {categoryLabel(d.category)}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {d.title}
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 1.5 }}>
                      From {d.donorName}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {d.quantity} {d.quantityUnit}
                    </Typography>
                    {d.description && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {d.description}
                      </Typography>
                    )}
                    <Typography variant="body2">Use-by: {formatDateTime(d.expiryDateTime)}</Typography>
                    <Typography variant="body2">Collect by: {formatDateTime(d.collectionDeadline)}</Typography>
                    {d.pickupAddress && <Typography variant="body2">Pickup: {d.pickupAddress}</Typography>}
                    {d.storageInfo && (
                      <Typography variant="body2" color="text.secondary">
                        Storage: {d.storageInfo}
                      </Typography>
                    )}
                    {d.dietaryInfo && (
                      <Typography variant="body2" color="text.secondary">
                        Dietary: {d.dietaryInfo}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button variant="contained" fullWidth disabled={!approved} onClick={() => openReserve(d)}>
                      Reserve
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </QueryState>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reserve "{selected?.title}"</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              Collect by {selected && formatDateTime(selected.collectionDeadline)}.
            </Typography>
            <TextField
              label="Pickup time"
              type="datetime-local"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmReserve} disabled={submitting}>
            {submitting ? 'Reserving...' : 'Confirm reservation'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage('')} message={message} />
    </>
  );
}
