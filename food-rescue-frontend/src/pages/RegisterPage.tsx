import { useState, type FormEvent } from 'react'
import { Alert, Button, Link as MuiLink, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser, registerUser, type RegisterRequest } from '../api/auth'
import { useAuth } from '../auth/useAuth'

export default function RegisterPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState<RegisterRequest>({ fullName: '', email: '', password: '', role: 'DONOR', organisationName: '', phoneNumber: '', address: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const field = (name: keyof RegisterRequest, value: string) => setForm((previous) => ({ ...previous, [name]: value }))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (!form.fullName.trim() || !form.password.trim()) { setError('Name and password cannot be blank.'); return }
    setBusy(true); setError('')
    const request = { ...form, fullName: form.fullName.trim(), email: form.email.trim() }
    try {
      await registerUser(request)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
      setBusy(false)
      return
    }
    try {
      const user = await loginUser(request.email, request.password)
      login(user)
      navigate('/', { replace: true })
    } catch {
      navigate('/login', { replace: true, state: { notice: '注册成功，请手动登录' } })
    } finally { setBusy(false) }
  }
  return (
    <Paper variant="outlined" sx={{ maxWidth: 560, mx: 'auto', p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack component="form" onSubmit={submit} spacing={3}>
        <Typography variant="h4" component="h1">Create an account</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Full name" required autoComplete="name" value={form.fullName} disabled={busy} onChange={(e) => field('fullName', e.target.value)} />
        <TextField label="Email" required type="email" autoComplete="username" value={form.email} disabled={busy} onChange={(e) => field('email', e.target.value)} />
        <TextField label="Password" required type="password" autoComplete="new-password" value={form.password} disabled={busy} onChange={(e) => field('password', e.target.value)} />
        <TextField label="Role" select required value={form.role} disabled={busy} onChange={(e) => field('role', e.target.value)}>
          <MenuItem value="DONOR">Donor</MenuItem>
          <MenuItem value="RECIPIENT_ORG">Recipient organisation</MenuItem>
        </TextField>
        <TextField label="Organisation name (optional)" autoComplete="organization" value={form.organisationName} disabled={busy} onChange={(e) => field('organisationName', e.target.value)} />
        <TextField label="Phone number (optional)" type="tel" autoComplete="tel" value={form.phoneNumber} disabled={busy} onChange={(e) => field('phoneNumber', e.target.value)} />
        <TextField label="Address (optional)" autoComplete="street-address" value={form.address} disabled={busy} onChange={(e) => field('address', e.target.value)} />
        <Button type="submit" variant="contained" disabled={busy}>{busy ? 'Creating account…' : 'Register'}</Button>
        <Typography>Already registered? <MuiLink component={Link} to="/login" state={location.state}>Log in</MuiLink></Typography>
      </Stack>
    </Paper>
  )
}


