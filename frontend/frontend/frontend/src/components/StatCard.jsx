import { Card, CardContent, Typography } from '@mui/material';

export default function StatCard({ label, value, sub, color = 'text.primary', highlight = false }) {
  return (
    <Card sx={{ height: '100%', ...(highlight ? { borderColor: 'error.main', borderWidth: 2 } : {}) }}>
      <CardContent>
        <Typography variant="h4" sx={{ color, lineHeight: 1.1 }}>
          {value ?? 0}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 600 }}>
          {label}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
