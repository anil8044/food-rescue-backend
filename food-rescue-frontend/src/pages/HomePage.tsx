import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { api } from '../api/client'

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
    <Stack spacing={4}>
      <Box>
        <Chip label="South Australian Food Rescue Network" color="primary" variant="outlined" sx={{ mb: 2 }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, maxWidth: 720 }}>
          Good food. Shared with our community.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 640 }}>
          Bringing food donors and community organisations together to reduce waste and help food reach people who need it.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
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
        ].map(([title, description]) => (
          <Paper key={title} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>{title}</Typography>
            <Typography color="text.secondary">{description}</Typography>
          </Paper>
        ))}
      </Box>
    </Stack>
  )
}


