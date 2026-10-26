import { Box, Chip } from '@mui/material';
import { STATUS_COLORS, humanize } from '../constants';

// type: 'donation' | 'reservation' | 'incident' | 'severity' | 'verification'
export default function StatusChip({ type, value, size = 'small' }) {
  const color = STATUS_COLORS[type]?.[value] || '#6b7770';
  return (
    <Chip
      size={size}
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
          {humanize(value)}
        </Box>
      }
      sx={{ bgcolor: `${color}26`, color, border: `1px solid ${color}4d`, fontWeight: 600 }}
    />
  );
}
