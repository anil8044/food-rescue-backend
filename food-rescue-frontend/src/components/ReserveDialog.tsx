import { useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import type { Donation } from '../api/donations'
import { createReservation, type Reservation } from '../api/reservations'
import { useAuth } from '../auth/useAuth'

export default function ReserveDialog({ donation, onClose, onReserved }: {
  donation: Donation; onClose: () => void; onReserved: (reservation: Reservation) => void
}) {
  const { user } = useAuth()
  const [time, setTime] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const approved = user?.role === 'RECIPIENT_ORG' && user.verificationStatus === 'APPROVED'
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !approved || !user) return
    let instant: string | undefined
    if (time) {
      const date = new Date(time)
      if (Number.isNaN(date.getTime())) { setError('Enter a valid pickup time.'); return }
      instant = date.toISOString()
    }
    setBusy(true); setError('')
    try {
      const reservation = await createReservation(user.id, donation.id, instant)
      onReserved(reservation)
    } catch (err) { setError(err instanceof Error ? err.message : 'Reservation failed.') }
    finally { setBusy(false) }
  }
  return (
    <Dialog open onClose={() => { if (!busy) onClose() }} fullWidth maxWidth="sm" aria-labelledby="reserve-title">
      <form onSubmit={submit}>
        <DialogTitle id="reserve-title">Reserve donation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="h6">{donation.title}</Typography>
            <Typography>{donation.quantity} {donation.quantityUnit} · Entire donation</Typography>
            <Typography>Pickup: {donation.pickupAddress || 'Not provided'}</Typography>
            <Typography>Collection deadline: {new Date(donation.collectionDeadline).toLocaleString()}</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {!approved && <Alert severity="warning">An approved recipient organisation account is required.</Alert>}
            <TextField label="Scheduled pickup time (optional)" type="datetime-local" value={time} onChange={(event) => setTime(event.target.value)}
              disabled={busy} slotProps={{ inputLabel: { shrink: true } }}
              helperText={`Times use your device time zone (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={busy || !approved}>{busy ? 'Reserving…' : 'Confirm reservation'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

