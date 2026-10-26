import { Box, Stack, Typography } from '@mui/material';

// A simple horizontal bar chart: rows = [{ label, value, color }]
export default function BarList({ rows, emptyText = 'Nothing to show yet.' }) {
  if (!rows.length) {
    return (
      <Typography color="text.secondary" variant="body2">
        {emptyText}
      </Typography>
    );
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Stack spacing={1.75}>
      {rows.map((r) => (
        <Box key={r.label}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">{r.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {r.value}
            </Typography>
          </Stack>
          <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(31,42,36,0.08)', mt: 0.5 }}>
            <Box
              sx={{ height: '100%', width: `${(r.value / max) * 100}%`, borderRadius: 4, bgcolor: r.color || 'primary.main' }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
