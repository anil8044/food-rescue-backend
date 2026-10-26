import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'
import { api } from '../api/client'

type DonorStatsData = {
  unreadNotifications: number
  totalDonations: number
  donationsByStatus: Record<string, number>
  totalQuantityDonated: number
}

type DonorStatsProps = {
  donorId: number
  refreshKey?: number
}

const cards = [
  {
    status: 'AVAILABLE',
    label: 'Available donations',
    color: '#236548',
  },
  {
    status: 'RESERVED',
    label: 'Reserved donations',
    color: '#a65a20',
  },
  {
    status: 'COLLECTED',
    label: 'Collected donations',
    color: '#2766ad',
  },
]

export default function DonorStats({
  donorId,
  refreshKey = 0,
}: DonorStatsProps) {
  const [stats, setStats] = useState<DonorStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadStats() {
      setLoading(true)
      setError('')

      try {
        const data = await api<DonorStatsData>(
          `/dashboard/user/${donorId}/stats`
        )

        if (active) setStats(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load statistics. Please try again.'
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
  }, [donorId, refreshKey])

  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <CircularProgress
          size={24}
          aria-label="Loading statistics"
        />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )
  }

  if (!stats) return null

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(3, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      {cards.map(card => (
        <Paper
          key={card.status}
          variant="outlined"
          sx={{ p: 2, borderTop: `4px solid ${card.color}` }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: card.color }}
          >
            {stats.donationsByStatus[card.status] ?? 0}
          </Typography>

          <Typography color="text.secondary">
            {card.label}
          </Typography>
        </Paper>
      ))}
    </Box>
  )
}