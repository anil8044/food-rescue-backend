import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { cancelDonation, getDonorDonations } from './api';

export default function DonationList({
  donorId,
  refreshKey = 0,
  onChanged,
}) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const cancelInProgress = useRef(false);

  // Load the list when the donor or refresh key changes.
  useEffect(() => {
    let active = true;

    async function loadDonations() {
      setLoading(true);
      setError('');

      try {
        const records = await getDonorDonations(donorId);

        if (active) {
          setDonations(
            [...records].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          );
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDonations();

    return () => {
      active = false;
    };
  }, [donorId, refreshKey]);

  // Replace the record only after the backend confirms cancellation.
  async function handleCancel(donation) {
    if (cancelInProgress.current) return;

    const confirmed = window.confirm(
      `Cancel "${donation.title}"? It will no longer be available to reserve.`
    );

    if (!confirmed) return;

    cancelInProgress.current = true;
    setCancellingId(donation.id);
    setError('');

    try {
      const updated = await cancelDonation(donation.id);

      setDonations((records) =>
        records.map((record) =>
          record.id === updated.id ? updated : record
        )
      );
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      cancelInProgress.current = false;
      setCancellingId(null);
    }
  }

  return (
    <Stack spacing={2}>
      <Typography component="h2" variant="h5" fontWeight={700}>
        My donations
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography>Loading donations…</Typography>
        </Stack>
      ) : (
        <>
          {!error && donations.length === 0 && (
            <Typography color="text.secondary">
              No donations yet. Post your first donation using the form.
            </Typography>
          )}

          {donations.map((donation) => (
            <Box
              key={donation.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Stack spacing={1}>
                <Typography fontWeight={700}>
                  {donation.title}
                </Typography>

                <Typography>
                  {donation.quantity} {donation.quantityUnit}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Posted: {new Date(donation.createdAt).toLocaleString('en-AU')}
                </Typography>

                <Typography variant="body2">
                  Status: {donation.status}
                </Typography>

                {donation.status === 'AVAILABLE' && (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={cancellingId !== null}
                    onClick={() => handleCancel(donation)}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {cancellingId === donation.id
                      ? 'Cancelling…'
                      : 'Cancel donation'}
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </>
      )}
    </Stack>
  );
}