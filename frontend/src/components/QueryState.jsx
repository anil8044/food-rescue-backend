import { Alert, Box, CircularProgress } from '@mui/material';

// Shows a spinner while loading, an error if the request failed, otherwise the children.
export default function QueryState({ loading, error, children }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  return children;
}
