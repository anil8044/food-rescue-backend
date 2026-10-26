import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { donationsApi } from '../../api';
import { CATEGORIES, UNITS } from '../../constants';
import { toIsoInstant } from '../../utils/format';

const emptyForm = (address) => ({
  title: '',
  description: '',
  category: '',
  quantity: '',
  quantityUnit: 'kg',
  dietaryInfo: '',
  storageInfo: '',
  expiryDateTime: '',
  collectionDeadline: '',
  pickupAddress: address || '',
});

// "Post a donation" panel. Sends exactly the fields the backend's CreateDonationRequest expects.
export default function DonationForm({ onPosted }) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm(user.address));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  function validate() {
    if (!form.title.trim()) return 'Please give the donation a title.';
    if (!form.category) return 'Please choose a category.';
    if (!(Number(form.quantity) > 0)) return 'Quantity must be greater than zero.';
    if (!form.expiryDateTime) return 'Please enter the expiry date and time.';
    if (!form.collectionDeadline) return 'Please enter the collect-by date and time.';
    if (new Date(form.expiryDateTime) <= new Date()) return 'The expiry time must be in the future.';
    if (new Date(form.collectionDeadline) <= new Date()) return 'The collect-by time must be in the future.';
    if (new Date(form.collectionDeadline) > new Date(form.expiryDateTime)) {
      return 'The collect-by time must be on or before the expiry time.';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');

    const payload = {
      title: form.title.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      quantityUnit: form.quantityUnit,
      expiryDateTime: toIsoInstant(form.expiryDateTime),
      collectionDeadline: toIsoInstant(form.collectionDeadline),
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.dietaryInfo.trim()) payload.dietaryInfo = form.dietaryInfo.trim();
    if (form.storageInfo.trim()) payload.storageInfo = form.storageInfo.trim();
    if (form.pickupAddress.trim()) payload.pickupAddress = form.pickupAddress.trim();

    setSubmitting(true);
    try {
      await donationsApi.create(user.id, payload);
      setForm(emptyForm(user.address));
      onPosted(`"${payload.title}" has been posted.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <Typography variant="h6">Post a donation</Typography>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField label="Food title" value={form.title} onChange={update('title')} fullWidth required />
        <TextField
          label="Description (optional)"
          value={form.description}
          onChange={update('description')}
          multiline
          minRows={2}
          fullWidth
        />
        <TextField select label="Category" value={form.category} onChange={update('category')} fullWidth required>
          {CATEGORIES.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={update('quantity')}
            inputProps={{ min: 0, step: 'any' }}
            fullWidth
            required
          />
          <TextField select label="Unit" value={form.quantityUnit} onChange={update('quantityUnit')} fullWidth>
            {UNITS.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label="Dietary information (optional)"
          value={form.dietaryInfo}
          onChange={update('dietaryInfo')}
          helperText="e.g. contains nuts, vegan, halal"
          fullWidth
        />
        <TextField
          label="Storage instructions (optional)"
          value={form.storageInfo}
          onChange={update('storageInfo')}
          helperText="e.g. keep refrigerated below 5 C"
          fullWidth
        />

        <Typography variant="subtitle1" sx={{ pt: 1 }}>
          Collection details
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: '-8px !important' }}>
          Times are in your device's time zone. Check the food label when entering the expiry.
        </Typography>
        <TextField
          label="Expiry date and time"
          type="datetime-local"
          value={form.expiryDateTime}
          onChange={update('expiryDateTime')}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />
        <TextField
          label="Collection deadline"
          type="datetime-local"
          value={form.collectionDeadline}
          onChange={update('collectionDeadline')}
          InputLabelProps={{ shrink: true }}
          helperText="Must be on or before the expiry"
          fullWidth
          required
        />
        <TextField label="Pickup address (optional)" value={form.pickupAddress} onChange={update('pickupAddress')} fullWidth />

        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post donation'}
        </Button>
      </Stack>
    </Box>
  );
}
