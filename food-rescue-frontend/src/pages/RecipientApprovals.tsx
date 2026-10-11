import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { api } from '../api/client'

type Recipient = {
  id: number
  fullName: string
  email: string
  role: string
  organisationName: string | null
  phoneNumber: string | null
  address: string | null
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export default function RecipientApprovals() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const actionInProgress = useRef(false)

  useEffect(() => {
    let active = true

    async function loadRecipients() {
      setLoading(true)
      setError('')

      try {
        const data = await api<Recipient[]>(
          '/users/pending-verifications'
        )

        if (active) {
          setRecipients(
            data
              .filter(recipient =>
                recipient.role === 'RECIPIENT_ORG' &&
                recipient.verificationStatus === 'PENDING'
              )
              .sort((a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              )
          )
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load pending applications.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadRecipients()

    return () => {
      active = false
    }
  }, [refreshKey])

  async function handleDecision(
    recipient: Recipient,
    decision: 'APPROVED' | 'REJECTED'
  ) {
    if (actionInProgress.current) return

    const organisation = recipient.organisationName || recipient.fullName
    const action = decision === 'APPROVED' ? 'Approve' : 'Reject'

    if (!window.confirm(`${action} "${organisation}"?`)) return

    actionInProgress.current = true
    setProcessingId(recipient.id)
    setError('')
    setSuccess('')

    try {
      const updated = await api<Recipient>(
        `/users/${recipient.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ verificationStatus: decision }),
        }
      )

      if (
        updated.id !== recipient.id ||
        updated.verificationStatus !== decision
      ) {
        throw new Error(
          'The server did not confirm the requested approval status. Refresh and check the application.'
        )
      }

      setRecipients(current =>
        current.filter(item => item.id !== recipient.id)
      )

      setSuccess(
        `${organisation} has been ${
          decision === 'APPROVED' ? 'approved' : 'rejected'
        }.`
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update the application. Please try again.'
      )
    } finally {
      actionInProgress.current = false
      setProcessingId(null)
    }
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        component="h1"
        variant="h4"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        Recipient approvals
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review applications from recipient organisations.
      </Typography>

      <Button
        variant="outlined"
        disabled={loading || processingId !== null}
        onClick={() => {
          setSuccess('')
          setRefreshKey(current => current + 1)
        }}
        sx={{ mb: 3 }}
      >
        Refresh applications
      </Button>

      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {loading ? (
          <CircularProgress
            size={24}
            aria-label="Loading pending applications"
          />
        ) : (
          <>
            {!error && recipients.length === 0 && (
              <Alert severity="info">
                No recipient organisations are awaiting approval.
              </Alert>
            )}

            {recipients.map(recipient => (
              <Paper key={recipient.id} variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {recipient.organisationName || recipient.fullName}
                  </Typography>

                  <Typography>Contact: {recipient.fullName}</Typography>
                  <Typography>Email: {recipient.email}</Typography>

                  {recipient.phoneNumber && (
                    <Typography>Phone: {recipient.phoneNumber}</Typography>
                  )}

                  {recipient.address && (
                    <Typography>Address: {recipient.address}</Typography>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    Applied: {new Date(recipient.createdAt).toLocaleString('en-AU')}
                  </Typography>

                  <Typography variant="body2">Status: PENDING</Typography>

                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ pt: 1 }}
                  >
                    <Button
                      variant="contained"
                      disabled={processingId !== null}
                      onClick={() =>
                        void handleDecision(recipient, 'APPROVED')
                      }
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      disabled={processingId !== null}
                      onClick={() =>
                        void handleDecision(recipient, 'REJECTED')
                      }
                    >
                      Reject
                    </Button>

                    {processingId === recipient.id && (
                      <CircularProgress
                        size={24}
                        aria-label="Updating application"
                      />
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </>
        )}
      </Stack>
    </Box>
  )
}