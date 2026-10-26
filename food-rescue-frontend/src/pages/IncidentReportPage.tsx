import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert, Box, Button, GlobalStyles, Paper,
  Stack, TextField, Typography,
} from '@mui/material'
import { getIncidentReport } from '../api/incidents'
import type { IncidentReport } from '../api/incidents'

function localToday() {
  const now = new Date()
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
  return local.toISOString().slice(0, 10)
}

const statusLabels = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under review',
  RESOLVED: 'Resolved',
}

export default function IncidentReportPage() {
  const [fromDate, setFromDate] = useState(localToday)
  const [toDate, setToDate] = useState(localToday)
  const [report, setReport] = useState<IncidentReport | null>(null)
  const [period, setPeriod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => request.current?.abort()
  }, [])

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    setError('')
    setReport(null)

    if (!fromDate || !toDate || fromDate > toDate) {
      setError('Select a valid date range. Start must not be after end.')
      return
    }

    const from = new Date(`${fromDate}T00:00:00`)
    const to = new Date(`${toDate}T23:59:59.999`)

    if (
      !Number.isFinite(from.getTime()) ||
      !Number.isFinite(to.getTime())
    ) {
      setError('Please enter valid dates.')
      return
    }

    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)

    try {
      const data = await getIncidentReport(
        from.toISOString(),
        to.toISOString(),
        controller.signal
      )

      if (!controller.signal.aborted) {
        setReport(data)
        setPeriod(`${fromDate} to ${toDate} (device local time)`)
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not generate the report.'
        )
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return (
    <Box sx={{ py: 4 }}>
      <GlobalStyles
        styles={{
          '@media print': {
            'body *': { visibility: 'hidden' },
            '#incident-report-output, #incident-report-output *': {
              visibility: 'visible',
            },
            '#incident-report-output': {
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              padding: '12mm',
              boxSizing: 'border-box',
            },
            '.incident-report-entry': {
              breakInside: 'avoid',
              boxShadow: 'none',
            },
          },
        }}
      />

      <Typography
        component="h1"
        variant="h4"
        sx={{ fontWeight: 700, mb: 3 }}
      >
        Incident report
      </Typography>

      <Box component="form" onSubmit={generate} sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <TextField
            id="incident-report-from"
            label="From date"
            type="date"
            required
            disabled={loading}
            value={fromDate}
            onChange={event => {
              setFromDate(event.target.value)
              setReport(null)
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            id="incident-report-to"
            label="To date"
            type="date"
            required
            disabled={loading}
            value={toDate}
            onChange={event => {
              setToDate(event.target.value)
              setReport(null)
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Generating…' : 'Generate report'}
          </Button>

          <Button
            variant="outlined"
            disabled={!report || loading}
            onClick={() => window.print()}
          >
            Print / Save PDF
          </Button>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Includes incidents reported during the selected local dates.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {report && (
        <Box id="incident-report-output">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Food Rescue — Incident report
          </Typography>

          <Typography sx={{ mb: 2 }}>
            Reporting period: {period}
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography>Total incidents: {report.totalIncidents}</Typography>
            <Typography>
              Open: {report.incidentsByStatus.OPEN ?? 0}
              {' | '}Under review: {report.incidentsByStatus.UNDER_REVIEW ?? 0}
              {' | '}Resolved: {report.incidentsByStatus.RESOLVED ?? 0}
            </Typography>
            <Typography>
              Low: {report.incidentsBySeverity.LOW ?? 0}
              {' | '}Medium: {report.incidentsBySeverity.MEDIUM ?? 0}
              {' | '}High: {report.incidentsBySeverity.HIGH ?? 0}
            </Typography>
          </Paper>

          {report.incidents.length === 0 && (
            <Typography>No incidents were reported in this period.</Typography>
          )}

          <Stack spacing={2}>
            {report.incidents.map(incident => (
              <Paper
                key={incident.id}
                className="incident-report-entry"
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Incident #{incident.id} — {
                      incident.donationTitle ||
                      `Donation #${incident.donationId}`
                    }
                  </Typography>

                  <Typography>
                    Donation reference: #{incident.donationId}
                  </Typography>

                  <Typography>
                    Donor: {incident.donorName || 'Not provided'}
                    {incident.donorOrganisation
                      ? ` (${incident.donorOrganisation})`
                      : ''}
                  </Typography>

                  <Typography>
                    Reporter: {incident.reportedByName || 'Not provided'}
                    {incident.reportedByOrganisation
                      ? ` (${incident.reportedByOrganisation})`
                      : ''}
                  </Typography>

                  <Typography>
                    Reported: {
                      new Date(incident.reportedAt).toLocaleString('en-AU')
                    }
                  </Typography>

                  <Typography>
                    Severity: {incident.severity}
                    {' | '}Status: {statusLabels[incident.status]}
                  </Typography>

                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    Problem: {incident.description}
                  </Typography>

                  {incident.additionalNotes && (
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      Additional notes: {incident.additionalNotes}
                    </Typography>
                  )}

                  {incident.adminNotes && (
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      Admin notes: {incident.adminNotes}
                    </Typography>
                  )}

                  {incident.status === 'RESOLVED' && (
                    <>
                      <Typography>
                        Resolved: {incident.resolvedAt
                          ? new Date(incident.resolvedAt).toLocaleString('en-AU')
                          : 'Not provided'}
                      </Typography>

                      <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                        Resolution: {incident.resolutionNotes}
                      </Typography>

                      {incident.donorFollowUp && (
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                          Donor follow-up: {incident.donorFollowUp}
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  )
}