import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert, Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, TextField,
} from '@mui/material'
import { resolveIncident } from '../api/incidents'
import type { Incident } from '../api/incidents'

type Props = {
  incident: Incident
  onClose: () => void
  onResolved: (incident: Incident) => void
}

function toLocalInput(date: Date) {
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
  return local.toISOString().slice(0, 19)
}

export default function ResolveIncidentDialog({
  incident,
  onClose,
  onResolved,
}: Props) {
  const [notes, setNotes] = useState('')
  const [resolvedOn, setResolvedOn] = useState(
    () => toLocalInput(new Date())
  )
  const [followUp, setFollowUp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setError('')

    const resolutionNotes = notes.trim()
    const donorFollowUp = followUp.trim()
    const date = new Date(resolvedOn)

    if (!resolutionNotes) {
      setError('Please explain what action was taken.')
      return
    }

    if (resolutionNotes.length > 1000 || donorFollowUp.length > 1000) {
      setError('Each note must be 1000 characters or fewer.')
      return
    }

    if (!Number.isFinite(date.getTime())) {
      setError('Please enter a valid resolution date and time.')
      return
    }

    if (date.getTime() > Date.now()) {
      setError('The resolution date cannot be in the future.')
      return
    }

    if (date.getTime() < new Date(incident.reportedAt).getTime()) {
      setError('Resolution cannot be earlier than the incident report.')
      return
    }

    submitting.current = true
    setBusy(true)

    try {
      const updated = await resolveIncident(incident.id, {
        resolutionNotes,
        resolvedOn: date.toISOString(),
        ...(donorFollowUp ? { donorFollowUp } : {}),
      })

      if (
        updated.id !== incident.id ||
        updated.status !== 'RESOLVED'
      ) {
        throw new Error(
          'The server did not confirm resolution. Refresh to check.'
        )
      }

      onResolved(updated)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not resolve the incident. Please try again.'
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={() => {
        if (!busy) onClose()
      }}
      aria-labelledby="resolve-incident-title"
    >
      <Box component="form" onSubmit={submit} aria-busy={busy}>
        <DialogTitle id="resolve-incident-title">
          Resolve incident #{incident.id}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              id="incident-resolution-notes"
              label="Resolution note"
              required
              multiline
              minRows={3}
              fullWidth
              disabled={busy}
              value={notes}
              onChange={event => setNotes(event.target.value)}
              helperText="Explain the action taken. Maximum 1000 characters."
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />

            <TextField
              id="incident-resolution-date"
              label="Resolution date and time"
              type="datetime-local"
              required
              fullWidth
              disabled={busy}
              value={resolvedOn}
              onChange={event => setResolvedOn(event.target.value)}
              helperText="Confirm the time in your device’s local time zone."
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { step: 1 },
              }}
            />

            <TextField
              id="incident-donor-follow-up"
              label="Donor follow-up (optional)"
              multiline
              minRows={2}
              fullWidth
              disabled={busy}
              value={followUp}
              onChange={event => setFollowUp(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button disabled={busy} onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? 'Saving…' : 'Confirm resolution'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}