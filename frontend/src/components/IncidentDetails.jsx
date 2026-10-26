import { Box, Typography } from '@mui/material';
import { formatDateTime } from '../utils/format';

// Shared read-only text for an incident: what happened plus the extra fields.
export default function IncidentDetails({ incident: i }) {
  const small = { whiteSpace: 'pre-line' };
  return (
    <>
      <Typography variant="body2">{i.description}</Typography>
      {i.additionalNotes && (
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5, ...small }}>
          Extra notes: {i.additionalNotes}
        </Typography>
      )}
      {i.adminNotes && (
        <Box sx={{ mt: 0.75 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Admin notes</Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={small}>
            {i.adminNotes}
          </Typography>
        </Box>
      )}
      {i.status === 'RESOLVED' && (
        <Box sx={{ mt: 0.75 }}>
          <Typography variant="caption" color="text.secondary" component="div">
            Resolved {formatDateTime(i.resolvedAt)}: {i.resolutionNotes}
          </Typography>
          {i.donorFollowUp && (
            <Typography variant="caption" color="text.secondary" component="div">
              Donor follow-up: {i.donorFollowUp}
            </Typography>
          )}
        </Box>
      )}
    </>
  );
}
