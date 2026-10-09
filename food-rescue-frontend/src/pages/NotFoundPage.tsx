import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">Page not found</Typography>
      <Typography>The page you requested does not exist.</Typography>
      <Button component={Link} to="/" variant="contained">Back to home</Button>
    </Stack>
  )
}


