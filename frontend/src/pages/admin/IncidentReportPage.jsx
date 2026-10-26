import { useState } from 'react';
import {
  Alert, Button, Card, CardContent, Grid, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { incidentsApi } from '../../api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import IncidentDetails from '../../components/IncidentDetails';
import StatusChip from '../../components/StatusChip';
import BarList from '../../components/BarList';
import { STATUS_COLORS, humanize } from '../../constants';
import { formatDateTime, toDateInputValue } from '../../utils/format';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// A simple record of incidents over a period, e.g. to show a regulator such as SA Health.
export default function IncidentReportPage() {
  const [from, setFrom] = useState(toDateInputValue(daysAgo(30)));
  const [to, setTo] = useState(toDateInputValue(new Date()));
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!from || !to) {
      setError('Please choose both dates.');
      return;
    }
    if (from > to) {
      setError('The start date must be on or before the end date.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Whole days in the viewer's local time, sent to the API as ISO instants
      const start = new Date(`${from}T00:00:00`).toISOString();
      const end = new Date(`${to}T23:59:59`).toISOString();
      setReport(await incidentsApi.report(start, end));
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  const toRows = (map, colors) =>
    Object.entries(map || {}).map(([key, value]) => ({ label: humanize(key), value, color: colors?.[key] }));

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Incident report"
        subtitle="A simple record of food-safety incidents over a period."
        action={
          report && (
            <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
              Print or save as PDF
            </Button>
          )
        }
      />

      <Paper sx={{ p: 2.5, mb: 3, '@media print': { display: 'none' } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="contained" onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate a new report'}
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {report && (
        <>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Incidents reported between {from} and {to}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <StatCard label="Incidents in this period" value={report.totalIncidents} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    By severity
                  </Typography>
                  <BarList rows={toRows(report.incidentsBySeverity, STATUS_COLORS.severity)} emptyText="None." />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    By status
                  </Typography>
                  <BarList rows={toRows(report.incidentsByStatus, STATUS_COLORS.incident)} emptyText="None." />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {report.incidents.length === 0 ? (
            <Alert severity="success">No incidents were reported in this period.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reported</TableCell>
                    <TableCell>Donation and donor</TableCell>
                    <TableCell>Reported by</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>What happened and how it was resolved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.incidents.map((i) => (
                    <TableRow key={i.id} sx={{ verticalAlign: 'top' }}>
                      <TableCell>{formatDateTime(i.reportedAt)}</TableCell>
                      <TableCell>
                        {i.donationTitle}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Donor: {i.donorOrganisation || i.donorName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {i.reportedByName}
                        {(i.reportedByOrganisation || i.reporterRole) && (
                          <Typography variant="caption" color="text.secondary" component="div">
                            {[i.reportedByOrganisation, i.reporterRole].filter(Boolean).join(' - ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusChip type="severity" value={i.severity} />
                      </TableCell>
                      <TableCell>
                        <StatusChip type="incident" value={i.status} />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 360 }}>
                        <IncidentDetails incident={i} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </>
  );
}
