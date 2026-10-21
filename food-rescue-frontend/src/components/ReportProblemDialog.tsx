import { useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { reportIncident, type Incident, type Severity } from '../api/incidents'
import type { Reservation } from '../api/reservations'
import { useAuth } from '../auth/useAuth'
export default function ReportProblemDialog({ reservation, onClose, onReported }: {
  reservation: Reservation; onClose: () => void; onReported: (incident: Incident) => void
}) {
  const { user } = useAuth()
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || busy || !severity) return
    if (!description.trim()) { setError('Description is required'); return }
    setBusy(true); setError('')
    try { onReported(await reportIncident(reservation.donationId, user.id, description, severity)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to report the problem.') }
    finally { setBusy(false) }
  }
  return (
    <Dialog open fullWidth maxWidth="sm" onClose={() => { if (!busy) onClose() }} aria-labelledby="report-title">
      <form onSubmit={submit}>
        <DialogTitle id="report-title">Report a problem</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography>{reservation.donationTitle} · Donation #{reservation.donationId}</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Severity" required value={severity} disabled={busy} onChange={(event) => setSeverity(event.target.value as Severity)}>
              <MenuItem value="MINOR">Minor</MenuItem><MenuItem value="MODERATE">Moderate</MenuItem><MenuItem value="SEVERE">Severe</MenuItem>
            </TextField>
            <TextField label="Description" required multiline minRows={4} value={description} disabled={busy} onChange={(event) => setDescription(event.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={busy}>{busy ? 'Submitting…' : 'Submit report'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
