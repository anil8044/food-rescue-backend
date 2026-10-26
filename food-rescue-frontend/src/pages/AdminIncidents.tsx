import { useEffect, useRef, useState } from 'react'
import {
  Alert, Box, Button, Chip, CircularProgress,
  MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material'
import {
  getIncidents,
  markIncidentUnderReview,
} from '../api/incidents'
import type { Incident, IncidentStatus } from '../api/incidents'
import ResolveIncidentDialog from '../components/ResolveIncidentDialog'

const statusLabels: Record<IncidentStatus, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under review',
  RESOLVED: 'Resolved',
}

export default function AdminIncidents() {
  const [filter, setFilter] = useState<IncidentStatus | ''>('')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)
  const actionInProgress = useRef(false)
  const [selectedIncident, setSelectedIncident] =
  useState<Incident | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await getIncidents(
          filter || undefined,
          controller.signal
        )

        if (active) {
          setIncidents(
            [...data].sort(
              (a, b) =>
                new Date(b.reportedAt).getTime() -
                new Date(a.reportedAt).getTime()
            )
          )
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load incidents.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
      controller.abort()
    }
  }, [filter, refreshKey])

  async function handleReview(incident: Incident) {
    if (actionInProgress.current) return

    if (!window.confirm(
      `Move incident #${incident.id} to Under review?`
    )) return

    actionInProgress.current = true
    setBusyId(incident.id)
    setError('')
    setSuccess('')

    try {
      const updated = await markIncidentUnderReview(incident.id)

      if (
        updated.id !== incident.id ||
        updated.status !== 'UNDER_REVIEW'
      ) {
        throw new Error(
          'The server did not confirm the status change. Refresh to check.'
        )
      }

      setSuccess(`Incident #${incident.id} is now under review.`)
      setRefreshKey(current => current + 1)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update the incident.'
      )
    } finally {
      actionInProgress.current = false
      setBusyId(null)
    }
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        component="h1"
        variant="h4"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        Incident management
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review reported problems and track their progress.
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          id="incident-status-filter"
          select
          label="Status"
          value={filter}
          disabled={busyId !== null}
          onChange={event => {
            setFilter(event.target.value as IncidentStatus | '')
            setSuccess('')
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="UNDER_REVIEW">Under review</MenuItem>
          <MenuItem value="RESOLVED">Resolved</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          disabled={loading || busyId !== null}
          onClick={() => {
            setSuccess('')
            setRefreshKey(current => current + 1)
          }}
        >
          Refresh incidents
        </Button>
      </Stack>

      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {loading ? (
          <CircularProgress
            size={24}
            aria-label="Loading incidents"
          />
        ) : (
          <>
            {!error && incidents.length === 0 && (
              <Alert severity="info">
                No incidents match the selected status.
              </Alert>
            )}

            {incidents.map(incident => (
              <Paper key={incident.id} variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Incident #{incident.id} — {
                      incident.donationTitle ||
                      `Donation #${incident.donationId}`
                    }
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={statusLabels[incident.status]}
                      variant="outlined"
                    />
                    <Chip
                      label={`Severity: ${incident.severity}`}
                      color={
                        incident.severity === 'HIGH'
                          ? 'error'
                          : incident.severity === 'MEDIUM'
                            ? 'warning'
                            : 'default'
                      }
                    />
                  </Stack>

                  <Typography>
                    Donation reference: #{incident.donationId}
                  </Typography>

                  <Typography>
                    Donor: {incident.donorOrganisation ||
                      incident.donorName || 'Not provided'}
                  </Typography>

                  <Typography>
                    Reported by: {incident.reportedByName || 'Not provided'}
                    {incident.reportedByOrganisation
                      ? ` (${incident.reportedByOrganisation})`
                      : ''}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Reported: {
                      new Date(incident.reportedAt).toLocaleString('en-AU')
                    }
                  </Typography>

                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {incident.description}
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
                      <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                        Resolution: {incident.resolutionNotes || 'Not provided'}
                      </Typography>

                      <Typography variant="body2">
                        Resolved: {incident.resolvedAt
                          ? new Date(incident.resolvedAt).toLocaleString('en-AU')
                          : 'Not provided'}
                      </Typography>

                      {incident.donorFollowUp && (
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                          Donor follow-up: {incident.donorFollowUp}
                        </Typography>
                      )}
                    </>
                  )}

                  {incident.status === 'OPEN' && (
                    <Button
                      variant="outlined"
                      disabled={busyId !== null}
                      onClick={() => void handleReview(incident)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {busyId === incident.id
                        ? 'Updating…'
                        : 'Mark under review'}
                    </Button>
                  )}

                  {incident.status !== 'RESOLVED' && (
                    <Button
                      variant="contained"
                      disabled={busyId !== null}
                      onClick={() => {
                        setError('')
                        setSuccess('')
                        setSelectedIncident(incident)
                      }}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Resolve incident
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </>
        )}
       </Stack>

      {selectedIncident && (
        <ResolveIncidentDialog
          key={selectedIncident.id}
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onResolved={updated => {
            setSelectedIncident(null)
            setSuccess(`Incident #${updated.id} has been resolved.`)
            setRefreshKey(current => current + 1)
          }}
        />
      )}
    </Box>
  )
}