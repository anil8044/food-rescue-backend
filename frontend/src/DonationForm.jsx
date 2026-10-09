import React, { useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { createDonation } from './api';

const categories = [
  ['FRESH_PRODUCE', 'Fresh produce'], ['BAKERY', 'Bakery'], ['DAIRY', 'Dairy'],
  ['MEAT_AND_SEAFOOD', 'Meat and seafood'], ['PANTRY_AND_DRY_GOODS', 'Pantry and dry goods'],
  ['PREPARED_MEALS', 'Prepared meals'], ['BEVERAGES', 'Beverages'], ['OTHER', 'Other'],
];
const blank = { title: '', description: '', category: '', quantity: '', quantityUnit: '', dietaryInfo: '', storageInfo: '', expiryDateTime: '', collectionDeadline: '', pickupAddress: '' };

// The standalone app passes 1. After login integration, pass the logged-in donor ID.
export default function DonationForm({ donorId, onCreated }) {
  const [form, setForm] = useState({ ...blank });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const submitting = useRef(false);
  const missingDonor = !Number.isSafeInteger(Number(donorId)) || Number(donorId) <= 0;
  const change = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const field = (name, label, extra = {}) => (
    <TextField key={name} name={name} label={label} value={form[name]} onChange={change} fullWidth disabled={busy} {...extra} />
  );

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || missingDonor) return;
    setError('');
    if (!form.title.trim() || !form.quantityUnit.trim()) {
      setError('Please enter a title and quantity unit, not just spaces.'); return;
    }
    const quantity = Number(form.quantity);
    const expiry = new Date(form.expiryDateTime);
    const collection = new Date(form.collectionDeadline);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('Quantity must be a positive number.'); return;
    }
    if (!Number.isFinite(expiry.getTime()) || !Number.isFinite(collection.getTime())) {
      setError('Please enter both dates and times.'); return;
    }
    // Additional UI checks proposed for this first version; confirm with the team.
    if (expiry <= new Date() || collection <= new Date()) {
      setError('Expiry and collection deadline must be in the future.'); return;
    }
    if (collection > expiry) {
      setError('Collection deadline must not be later than expiry.'); return;
    }
    submitting.current = true;
    setBusy(true);
    setCreated(null);
    const payload = { ...form, title: form.title.trim(), quantityUnit: form.quantityUnit.trim(), quantity,
      expiryDateTime: expiry.toISOString(), collectionDeadline: collection.toISOString() };
    try {
      const donation = await createDonation(Number(donorId), payload);
      setCreated(donation);
      setForm({ ...blank });
      onCreated?.(donation);
    } catch (failure) {
      setError(failure.message); // Keep the filled fields so a failed request loses no work.
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <Box component="form" onSubmit={submit} aria-busy={busy}>
      <Stack spacing={3}>
        {missingDonor && <Alert severity="warning">Please sign in as a donor before posting.</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {created && <Alert severity="success">
          Donation #{created.id} posted successfully.
        </Alert>}
        <Typography component="h2" variant="h6">Food details</Typography>
        {field('title', 'Food title', { required: true })}
        {field('description', 'Description (optional)', { multiline: true, minRows: 2 })}
        {field('category', 'Category', { required: true, select: true, children: categories.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) })}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {field('quantity', 'Quantity', { required: true, type: 'number', slotProps: { htmlInput: { min: '0.000001', step: 'any' } } })}
          {field('quantityUnit', 'Unit', { required: true, helperText: 'For example: kg, cartons or portions' })}
        </Box>
        {field('dietaryInfo', 'Dietary information (optional)', { multiline: true, minRows: 2 })}
        {field('storageInfo', 'Storage instructions (optional)', { multiline: true, minRows: 2 })}
        <Typography component="h2" variant="h6">Collection details</Typography>
        <Typography variant="body2" color="text.secondary">Enter times in your device’s local time zone. Check the food label when entering expiry.</Typography>
        {field('expiryDateTime', 'Expiry date and time', { required: true, type: 'datetime-local', slotProps: { inputLabel: { shrink: true } } })}
        {field('collectionDeadline', 'Collection deadline', { required: true, type: 'datetime-local', slotProps: { inputLabel: { shrink: true } } })}
        {field('pickupAddress', 'Pickup address (optional)')}
        <Button type="submit" variant="contained" size="large" disabled={busy || missingDonor} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}>
          {busy ? 'Posting…' : 'Post donation'}
        </Button>
      </Stack>
    </Box>
  );
}
