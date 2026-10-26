import { useRef, useState } from 'react';
import {
  Alert, Button, Paper, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { missedApi, usersApi } from '../../api';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import QueryState from '../../components/QueryState';
import StatusChip from '../../components/StatusChip';
import { formatDateTime } from '../../utils/format';

export default function MissedCollectionsPage() {
  const summary = useFetch(() => missedApi.summary(), []);
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const locked = useRef(false);
  const [confirming, setConfirming] = useState(null);

  async function decide(org) {
    if (locked.current || summary.loading) return;
    const suspended = org.verificationStatus === 'REJECTED';
    const name = org.organisationName || org.recipientName;

    setConfirming(null);
    locked.current = true;
    setBusyId(org.recipientId);
    setActionError('');
    try {
      await usersApi.update(org.recipientId, { verificationStatus: suspended ? 'APPROVED' : 'REJECTED' });
      setMessage(`${name} was ${suspended ? 'reinstated' : 'suspended'}.`);
      await summary.reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      locked.current = false;
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Admin console" title="Missed collections"
        subtitle="Review missed pickups and decide whether an organisation should be suspended or reinstated." />
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      <Button onClick={summary.reload} disabled={summary.loading || busyId !== null} sx={{ mb: 2 }}>Refresh</Button>
      <QueryState loading={summary.loading} error={summary.error}>
        {(summary.data || []).length === 0 ? <Alert severity="info">No missed collections</Alert> : (
          <TableContainer component={Paper}>
            <Table size="small" aria-label="Missed collections">
              <TableHead><TableRow>
                <TableCell>Organisation</TableCell><TableCell>Contact</TableCell>
                <TableCell>Missed count</TableCell><TableCell>Missed items and deadlines</TableCell>
                <TableCell>Verification status</TableCell><TableCell align="right">Action</TableCell>
              </TableRow></TableHead>
              <TableBody>{summary.data.map((org) => (
                <TableRow key={org.recipientId} hover>
                  <TableCell>{org.organisationName || org.recipientName}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{org.recipientName}</Typography>
                      <Typography variant="body2">{org.email}</Typography>
                      <Typography variant="body2">{org.phoneNumber || 'Not provided'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{org.missedCount}</TableCell>
                  <TableCell>
                    <Stack spacing={1}>{(org.missedItems || []).map((item) => (
                      <div key={item.donationId}>
                        <Typography variant="body2">{item.donationTitle}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDateTime(item.collectionDeadline)}</Typography>
                      </div>
                    ))}</Stack>
                  </TableCell>
                  <TableCell><StatusChip type="verification" value={org.verificationStatus} /></TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" disabled={busyId !== null}
                      color={org.verificationStatus === 'REJECTED' ? 'primary' : 'error'} onClick={() => org.verificationStatus === 'REJECTED' ? decide(org) : setConfirming(org)}>
                      {busyId === org.recipientId ? 'Saving…' : org.verificationStatus === 'REJECTED' ? 'Reinstate' : 'Suspend'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryState>
      <Dialog open={Boolean(confirming)} onClose={() => setConfirming(null)} aria-labelledby="suspend-title" aria-describedby="suspend-description">
        <DialogTitle id="suspend-title">Suspend organisation?</DialogTitle>
        <DialogContent><DialogContentText id="suspend-description">
          Suspend {confirming?.organisationName || confirming?.recipientName}? This organisation will not be able to reserve food.
        </DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirming(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => decide(confirming)}>Confirm suspension</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage('')} message={message} />
    </>
  );
}


