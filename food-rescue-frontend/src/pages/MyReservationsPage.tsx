import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { cancelReservation, collectReservation, getMyReservations, type Reservation } from '../api/reservations'
import { useAuth } from '../auth/useAuth'
import ReportProblemDialog from '../components/ReportProblemDialog'
export default function MyReservationsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  const [report, setReport] = useState<Reservation | null>(null)
  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    getMyReservations(user.id, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setItems(data) })
      .catch((err: unknown) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load reservations.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user, revision])
  function refresh() { setLoading(true); setError(''); setRevision((value) => value + 1) }
  async function act(item: Reservation, action: 'collect' | 'cancel') {
    if (busy) return
    setBusy(true); setError(''); setSuccess('')
    try {
      if (action === 'collect') await collectReservation(item.id)
      else await cancelReservation(item.id)
      setSuccess(`Reservation #${item.id} ${action === 'collect' ? 'marked as collected' : 'cancelled'}.`)
      refresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update reservation.') }
    finally { setBusy(false) }
  }
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">My reservations</Typography>
      <Stack direction="row" spacing={2}>
        <Button component={Link} to="/donations">Browse donations</Button>
        <Button variant="outlined" onClick={refresh} disabled={loading || busy}>Refresh reservations</Button>
      </Stack>
      {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" action={<Button color="inherit" disabled={busy} onClick={refresh}>Retry</Button>}>{error}</Alert>}
      <Box aria-live="polite">
        {loading ? <Stack direction="row" spacing={2}><CircularProgress size={24} /><Typography>Loading reservations…</Typography></Stack>
          : !error && items.length === 0 ? <Alert severity="info">You have no reservations yet.</Alert>
          : <Stack spacing={2}>{items.map((item) => (
            <Paper variant="outlined" key={item.id} sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" component="h2">{item.donationTitle}</Typography>
                <Chip label={item.status} size="small" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="body2">Reservation #{item.id} · Donation #{item.donationId}</Typography>
                <Typography variant="body2">Reserved: {new Date(item.reservedAt).toLocaleString()}</Typography>
                <Typography variant="body2">Scheduled pickup: {item.scheduledPickupTime ? new Date(item.scheduledPickupTime).toLocaleString() : 'Not scheduled'}</Typography>
                {item.collectedAt && <Typography variant="body2">Collected: {new Date(item.collectedAt).toLocaleString()}</Typography>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button variant="contained" disabled={busy} onClick={() => act(item, 'collect')}>Mark collected</Button>
                  <Button variant="outlined" color="error" disabled={busy} onClick={() => act(item, 'cancel')}>Cancel reservation</Button>
                  <Button variant="outlined" disabled={busy} onClick={() => setReport(item)}>Report a problem</Button>
                </Stack>
              </Stack>
            </Paper>
          ))}</Stack>}
      </Box>
      {report && <ReportProblemDialog key={report.id} reservation={report} onClose={() => setReport(null)} onReported={(incident) => {
        setReport(null); setSuccess(`Problem reported. Incident #${incident.id}. Status: ${incident.status}.`)
      }} />}
    </Stack>
  )
}
