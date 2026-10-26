import { useState } from 'react';
import {
  Alert, Button, Paper, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import { usersApi } from '../../api';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import QueryState from '../../components/QueryState';
import StatusChip from '../../components/StatusChip';
import { formatDateTime } from '../../utils/format';

// Recipient organisations start as PENDING and cannot reserve until an admin approves them.
export default function RecipientApprovalsPage() {
  const pending = useFetch(() => usersApi.pending(), []);
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  async function decide(org, status) {
    if (status === 'REJECTED' && !window.confirm(`Reject ${org.organisationName || org.fullName}?`)) return;
    setActionError('');
    try {
      await usersApi.update(org.id, { verificationStatus: status });
      setMessage(`${org.organisationName || org.fullName} was ${status === 'APPROVED' ? 'approved' : 'rejected'}.`);
      pending.reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Recipient approvals"
        subtitle="Check new recipient organisations before they can reserve food."
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <QueryState loading={pending.loading} error={pending.error}>
        {(pending.data || []).length === 0 ? (
          <Alert severity="success">Nobody is waiting for approval.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Organisation</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Decision</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pending.data.map((org) => (
                  <TableRow key={org.id} hover>
                    <TableCell>{org.organisationName}</TableCell>
                    <TableCell>{org.fullName}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{formatDateTime(org.createdAt)}</TableCell>
                    <TableCell>
                      <StatusChip type="verification" value={org.verificationStatus} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="contained" onClick={() => decide(org, 'APPROVED')}>
                          Approve
                        </Button>
                        <Button size="small" color="error" onClick={() => decide(org, 'REJECTED')}>
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryState>

      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage('')} message={message} />
    </>
  );
}
