import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { api } from '../api/client'
import { COLORS } from '../theme'
import BrandMark from '../components/BrandMark'

type Connection =
  | { state: 'loading' }
  | { state: 'ready'; count: number }
  | { state: 'error'; message: string }

export default function HomePage() {
  const [connection, setConnection] = useState<Connection>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api<unknown[]>('/donations/available', { signal: controller.signal })
      .then((donations) => {
        if (!controller.signal.aborted) {
          if (!Array.isArray(donations)) throw new Error('The server returned an unexpected response.')
          setConnection({ state: 'ready', count: donations.length })
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setConnection({ state: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' })
        }
      })
    return () => controller.abort()
  }, [attempt])

  return (
    <Stack spacing={5}>
      <Box sx={{ p: { xs: 3, md: 6 }, borderRadius: 5, background: 'linear-gradient(120deg, #e6f3ea 0%, #fbf8f3 70%, #fdebdc 100%)', border: '1px solid rgba(43,138,87,.12)' }}>
        <Box sx={{ mb: 3 }}><BrandMark size={56} /></Box>
<Chip label="South Australian Food Rescue Network" color="primary" variant="outlined" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,.65)' }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 400, maxWidth: 720, fontSize: { xs: '2.5rem', md: '3.8rem' }, lineHeight: 1.12 }}>
          Good food. Shared with our community.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 640 }}>
          Bringing food donors and community organisations together to reduce waste and help food reach people who need it.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>Service status</Typography>
        <Box aria-live="polite">
          {connection.state === 'loading' && (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <CircularProgress size={20} />
              <Typography>Connecting to Food Rescue…</Typography>
            </Stack>
          )}
          {connection.state === 'ready' && (
            <Alert severity="success">
              Connected. {connection.count === 0
                ? 'There are no available donations yet.'
                : `${connection.count} donation(s) available.`}
            </Alert>
          )}
          {connection.state === 'error' && (
            <Alert severity="error" action={
              <Button color="inherit" onClick={() => {
                setConnection({ state: 'loading' })
                setAttempt((value) => value + 1)
              }}>Retry</Button>
            }>{connection.message}</Alert>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {[
          ['Donate food', 'Share surplus food with local community organisations.'],
          ['Receive food', 'Find donations and arrange collection for your organisation.'],
          ['Support safe sharing', 'Keep food information and reported concerns together.'],
        ].map(([title, description], index) => (
          <Paper key={title} variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
            <Box aria-hidden="true" sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: [COLORS.mint, COLORS.peach, COLORS.sky][index], color: 'primary.main', display: 'grid', placeItems: 'center', mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>0{index + 1}</Box>
<Typography variant="h6" component="h2" gutterBottom>{title}</Typography>
            <Typography color="text.secondary">{description}</Typography>
          </Paper>
        ))}
      </Box>
    </Stack>
  )
}
