import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { categories, getAvailableDonations, type Category, type Donation } from '../api/donations'
import type { Reservation } from '../api/reservations'
import { useAuth } from '../auth/useAuth'
import ReserveDialog from '../components/ReserveDialog'

export default function BrowseDonationsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const requestedCategory = params.get('category') || ''
  const category = Object.hasOwn(categories, requestedCategory) ? requestedCategory : ''
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState<Donation | null>(null)
  const [revision, setRevision] = useState(0)
  const approved = user?.role === 'RECIPIENT_ORG' && user.verificationStatus === 'APPROVED'
  useEffect(() => {
    const controller = new AbortController()
    getAvailableDonations(controller.signal)
      .then((items) => { if (!controller.signal.aborted) setDonations(items) })
      .catch((err: unknown) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load donations.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])
  function refresh() { setLoading(true); setError(''); setRevision((value) => value + 1) }
  function reserve(donation: Donation) {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search + location.hash } })
      return
    }
    if (approved) setSelected(donation)
  }
  function reserved(reservation: Reservation) {
    setSelected(null)
    setSuccess(`Reservation #${reservation.id} created for ${reservation.donationTitle}. Status: ${reservation.status}.`)
    setDonations((items) => items.filter((item) => item.id !== reservation.donationId))
    refresh()
  }
  const visible = donations.filter((item) => !category || item.category === category)
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">Browse donations</Typography>
      <Typography color="text.secondary">Find food available for your community organisation.</Typography>
      {!user && <Alert severity="info">You can browse freely. Log in as an approved recipient organisation to reserve food.</Alert>}
      {user?.role === 'RECIPIENT_ORG' && !approved && <Alert severity={user.verificationStatus === 'REJECTED' ? 'error' : 'warning'}>
        {user.verificationStatus === 'REJECTED' ? 'Your organisation verification was rejected.' : 'Your organisation is awaiting approval.'}
        {' '}You can browse, but cannot reserve food. After approval, log out and log in again to update your status.
      </Alert>}
      {user && user.role !== 'RECIPIENT_ORG' && <Alert severity="info">Reservations are available to approved recipient organisations.</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField select label="Category" value={category in categories ? category : ''} sx={{ minWidth: 250 }} onChange={(event) => {
          const next = new URLSearchParams(params)
          if (event.target.value) next.set('category', event.target.value)
          else next.delete('category')
          setParams(next)
        }}>
          <MenuItem value="">All categories</MenuItem>
          {Object.entries(categories).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
        </TextField>
        <Button variant="outlined" onClick={refresh} disabled={loading}>Refresh donations</Button>
      </Stack>
      <Box aria-live="polite">
        {loading ? <Stack direction="row" spacing={2}><CircularProgress size={24} /><Typography>Loading donations…</Typography></Stack>
          : error ? <Alert severity="error" action={<Button color="inherit" onClick={refresh}>Retry</Button>}>{error}</Alert>
          : visible.length === 0 ? <Alert severity="info">{category ? 'No donations match this category.' : 'There are no available donations yet.'}</Alert>
          : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {visible.map((donation) => <Paper key={donation.id} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Chip label={categories[donation.category as Category] || donation.category} size="small" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="h6" component="h2">{donation.title}</Typography>
                <Typography>{donation.quantity} {donation.quantityUnit} · {donation.donorName}</Typography>
                {donation.description && <Typography>{donation.description}</Typography>}
                <Typography variant="body2">Expires: {new Date(donation.expiryDateTime).toLocaleString()}</Typography>
                <Typography variant="body2">Collect by: {new Date(donation.collectionDeadline).toLocaleString()}</Typography>
                <Typography variant="body2">Pickup: {donation.pickupAddress || 'Not provided'}</Typography>
                <Typography variant="body2">Dietary information: {donation.dietaryInfo || 'Not provided'}</Typography>
                <Typography variant="body2">Storage: {donation.storageInfo || 'Not provided'}</Typography>
                <Button variant="contained" disabled={!!user && !approved} onClick={() => reserve(donation)} sx={{ alignSelf: 'flex-start' }}>
                  {user ? 'Reserve donation' : 'Log in to reserve'}
                </Button>
              </Stack>
            </Paper>)}
          </Box>}
      </Box>
      {selected && <ReserveDialog key={selected.id} donation={selected} onClose={() => setSelected(null)} onReserved={reserved} />}
    </Stack>
  )
}


