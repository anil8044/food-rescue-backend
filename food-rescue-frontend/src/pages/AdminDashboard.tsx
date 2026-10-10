import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'
import { api } from '../api/client'

type DashboardStats = {
  totalDonations: number
  activeDonations: number
  totalReservations: number
  completedReservations: number
  totalUsers: number
  verifiedRecipients: number
  pendingVerifications: number
  totalIncidents: number
  unresolvedIncidents: number
  incidentsByStatus: Record<string, number>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadStats() {
      setLoading(true)
      setError('')

      try {
        const data = await api<DashboardStats>('/dashboard/stats')
        if (active) setStats(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load dashboard statistics.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadStats()

    return () => {
      active = false
    }
  }, [refreshKey])

  const cards = stats
    ? [
        { label: 'Total donations', value: stats.totalDonations },
        { label: 'Active donations', value: stats.activeDonations },
        { label: 'Total reservations', value: stats.totalReservations },
        { label: 'Completed reservations', value: stats.completedReservations },
        { label: 'Total users', value: stats.totalUsers },
        { label: 'Verified recipients', value: stats.verifiedRecipients },
        { label: 'Pending approvals', value: stats.pendingVerifications },
        { label: 'Total incidents', value: stats.totalIncidents },
        { label: 'Unresolved incidents', value: stats.unresolvedIncidents },
      ]
    : []

  const openIncidents = stats?.incidentsByStatus.OPEN ?? 0

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        component="h1"
        variant="h4"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        Admin dashboard
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Overview of donations, recipient approvals and reported incidents.
      </Typography>

      <Button
        variant="outlined"
        disabled={loading}
        onClick={() => setRefreshKey(current => current + 1)}
        sx={{ mb: 3 }}
      >
        Refresh statistics
      </Button>

      {loading && (
        <Box>
          <CircularProgress
            size={24}
            aria-label="Loading dashboard statistics"
          />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">{error}</Alert>
      )}

      {!loading && !error && stats && (
        <>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 3,
              borderLeft: '6px solid',
              borderColor: openIncidents > 0 ? 'error.main' : 'divider',
              bgcolor: openIncidents > 0 ? '#fff4f4' : 'background.paper',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: openIncidents > 0 ? 'error.main' : 'text.primary',
              }}
            >
              {openIncidents}
            </Typography>

            <Typography sx={{ fontWeight: 700 }}>
              Open incidents
            </Typography>

            <Typography color="text.secondary">
              {openIncidents > 0
                ? 'Open incident reports need administrator attention.'
                : 'No incidents currently have Open status.'}
            </Typography>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {cards.map(card => (
              <Paper key={card.label} variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>

                <Typography color="text.secondary">
                  {card.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}