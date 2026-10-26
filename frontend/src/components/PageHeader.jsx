import { Box, Typography } from '@mui/material';
import { COLORS } from '../theme';

// Small green label above a big serif title, like the design's "Donor Portal" / "Your Donation Hub"
export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 4 }}>
      <Box>
        {eyebrow && (
          <Typography
            sx={{ color: COLORS.primary, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 1 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.6rem' } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
