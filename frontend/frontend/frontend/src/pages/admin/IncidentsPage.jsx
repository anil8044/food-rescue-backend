import { useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { incidentsApi } from '../../api';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import QueryState from '../../components/QueryState';
import IncidentDetails from '../../components/IncidentDetails';
import StatusChip from '../../components/StatusChip';
import { formatDateTime } from '../../utils/format';

// Today's date as yyyy-mm-dd in the viewer's own time zone (toISOString would give the UTC date).
function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'RESOLVED', label: 'Resolved' },
];

// Admin view of the food-safety flags raised by recipient organisations:
// review them, move them along, and resolve them with notes.
export default function IncidentsPage() {
  const [filter, setFilter] = useState('OPEN');
  const [resolving, setResolving] = useState(null);
  const [notes, setNotes] = useState('');
  const [resolvedOn, setResolvedOn] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [noting, setNoting] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  const incidents = useFetch(
    () => (filter === 'ALL' ? incidentsApi.all() : incidentsApi.byStatus(filter)),
    [filter]
  );

  async function startReview(incident) {
    setActionError('');
    try {
      await incidentsApi.setStatus(incident.id, 'UNDER_REVIEW');
      setMessage(`Incident #${incident.id} is now under review.`);
      incidents.reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  function openResolve(incident) {
    setResolving(incident);
    setNotes('');
    setResolvedOn(localDateString());
    setFollowUp('');
    setDialogError('');
  }

  function openNote(incident) {
    setNoting(incident);
    setNoteText('');
    setNoteError('');
  }

  async function saveNote() {
    if (!noteText.trim()) {
      setNoteError('Please write a note.');
      return;
    }
    setSubmitting(true);
    setNoteError('');
    try {
      await incidentsApi.addNote(noting.id, noteText.trim());
      setMessage(`Note added to incident #${noting.id}.`);
      setNoting(null);
      incidents.reload();
    } catch (err) {
      setNoteError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmResolve() {
    if (!notes.trim()) {
      setDialogError('Please record what was done to resolve it.');
      return;
    }
    setSubmitting(true);
    setDialogError('');
    try {
      const body = { resolutionNotes: notes.trim(), donorFollowUp: followUp.trim() || undefined };
      // Today: leave it out so the server uses the current time (always after the report time).
      // An earlier day: use the end of that day, which can never be in the future.
      if (resolvedOn && resolvedOn !== localDateString()) {
        body.resolvedOn = new Date(`${resolvedOn}T23:59:59`).toISOString();
      }
      await incidentsApi.resolve(resolving.id, body);
      setMessage(`Incident #${resolving.id} resolved.`);
      setResolving(null);
      incidents.reload();
    } catch (err) {
      setDialogError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Food-safety incidents"
        subtitle="Follow up problems reported by recipient organisations and keep a record of how each one was resolved."
      />

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            clickable
            color={filter === f.value ? 'primary' : 'default'}
            variant={filter === f.value ? 'filled' : 'outlined'}
            onClick={() => setFilter(f.value)}
          />
        ))}
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <QueryState loading={incidents.loading} error={incidents.error}>
        {(incidents.data || []).length === 0 ? (
          <Alert severity="info">No incidents in this view.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Reported</TableCell>
                  <TableCell>Donation and donor</TableCell>
                  <TableCell>Reported by</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>What happened</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidents.data.map((i) => (
                  <TableRow key={i.id} hover sx={{ verticalAlign: 'top' }}>
                    <TableCell>{formatDateTime(i.reportedAt)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {i.donationTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Donor: {i.donorOrganisation || i.donorName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {i.reportedByName}
                      {(i.reportedByOrganisation || i.reporterRole) && (
                        <Typography variant="caption" color="text.secondary" component="div">
                          {[i.reportedByOrganisation, i.reporterRole].filter(Boolean).join(' - ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip type="severity" value={i.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusChip type="incident" value={i.status} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <IncidentDetails incident={i} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end" useFlexGap flexWrap="wrap">
                        {i.status === 'OPEN' && (
                          <Button size="small" color="inherit" onClick={() => startReview(i)}>
                            Start review
                          </Button>
                        )}
                        {i.status !== 'RESOLVED' && (
                          <Button size="small" color="inherit" onClick={() => openNote(i)}>
                            Add note
                          </Button>
                        )}
                        {i.status !== 'RESOLVED' && (
                          <Button size="small" variant="contained" onClick={() => openResolve(i)}>
                            Resolve
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryState>

      <Dialog open={Boolean(resolving)} onClose={() => setResolving(null)} fullWidth maxWidth="sm">
        <DialogTitle>Resolve incident #{resolving?.id}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              {resolving?.donationTitle}: {resolving?.description}
            </Typography>
            <TextField
              label="Resolution notes"
              helperText="What was done, for example who was contacted and what changes were made."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={4}
              inputProps={{ maxLength: 1000 }}
              fullWidth
            />
            <TextField
              label="Date resolved"
              type="date"
              value={resolvedOn}
              onChange={(e) => setResolvedOn(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: localDateString() }}
              helperText="The day the resolution was confirmed. It can't be in the future."
            />
            <TextField
              label="Donor follow-up (optional)"
              helperText="What was passed back to the donor."
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              multiline
              minRows={2}
              inputProps={{ maxLength: 1000 }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {dialogError && (
            <Typography variant="body2" color="error" sx={{ flexGrow: 1, pl: 1 }}>
              {dialogError}
            </Typography>
          )}
          <Button color="inherit" onClick={() => setResolving(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmResolve} disabled={submitting}>
            {submitting ? 'Saving...' : 'Mark resolved'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(noting)} onClose={() => setNoting(null)} fullWidth maxWidth="sm">
        <DialogTitle>Add a note to incident #{noting?.id}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {noteError && <Alert severity="error">{noteError}</Alert>}
            <TextField
              label="Admin note"
              helperText="Notes are dated automatically and added to the record."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              multiline
              minRows={3}
              inputProps={{ maxLength: 1000 }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setNoting(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveNote} disabled={submitting}>
            {submitting ? 'Saving...' : 'Add note'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage('')} message={message} />
    </>
  );
}