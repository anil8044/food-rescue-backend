import { useEffect, useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { incidentsApi } from '../../api';
import { SEVERITIES } from '../../constants';

// Lets a recipient organisation report a food-safety or quality problem with a donation.
export default function FlagProblemDialog({ open, reservation, userId, onClose, onReported }) {
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [reporterRole, setReporterRole] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSeverity('');
      setDescription('');
      setReporterRole('');
      setAdditionalNotes('');
      setError('');
    }
  }, [open]);

  async function handleSubmit() {
    if (!severity) {
      setError('Please choose how serious the problem is.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe what went wrong.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await incidentsApi.flag(reservation.donationId, userId, {
        description: description.trim(),
        severity,
        reporterRole: reporterRole.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
      });
      onReported('Problem reported. An administrator will follow it up.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Report a problem with "{reservation?.donationTitle}"</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Use this if something was wrong at collection or shortly after, for example a use-by date that didn't
            match what you were told. Don't serve the food if you think it is unsafe.
          </Typography>
          <TextField select label="How serious is it?" value={severity} onChange={(e) => setSeverity(e.target.value)} fullWidth>
            {SEVERITIES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label} - {s.help}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="What went wrong?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
            inputProps={{ maxLength: 1000 }}
            fullWidth
          />
          <TextField
            label="Your role (optional)"
            helperText="For example kitchen manager, volunteer."
            value={reporterRole}
            onChange={(e) => setReporterRole(e.target.value)}
            inputProps={{ maxLength: 100 }}
            fullWidth
          />
          <TextField
            label="Anything else we should know? (optional)"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            multiline
            minRows={2}
            inputProps={{ maxLength: 1000 }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Sending...' : 'Report problem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
