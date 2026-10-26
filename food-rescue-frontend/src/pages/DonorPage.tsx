import { useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useAuth } from '../auth/useAuth'
import DonationForm from '../components/DonationForm'
import DonationList from '../components/DonationList'
import DonorStats from '../components/DonorStats'

export default function DonorPage() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  if (!user) return null

  const refreshDonations = () => {
    setRefreshKey(current => current + 1)
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Your Donation Hub
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Welcome, {user.fullName}. Share surplus food with local
        recipient organisations.
      </Typography>

      <DonorStats
  key={user.id}
  donorId={user.id}
  refreshKey={refreshKey}
/>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <DonationList
            key={user.id}
            donorId={user.id}
            refreshKey={refreshKey}
            onChanged={refreshDonations}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <DonationForm
            key={user.id}
            donorId={user.id}
            onCreated={refreshDonations}
          />
        </Paper>
      </Box>
    </Box>
  )
}