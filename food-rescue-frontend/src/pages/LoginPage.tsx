import { useState, type FormEvent } from 'react'
import { Alert, Button, Link as MuiLink, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useAuth } from '../auth/useAuth'
import { canVisit, safeReturnTo } from '../auth/session'

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const state = location.state as { from?: unknown; notice?: string } | null
  const from = safeReturnTo(state?.from)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      const user = await loginUser(email.trim(), password)
      login(user)
      navigate(canVisit(from, user.role) ? from : '/', {
        replace: true, state: canVisit(from, user.role) ? null : { denied: true },
      })
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed.') }
    finally { setBusy(false) }
  }
  return (
    <Paper variant="outlined" sx={{ maxWidth: 480, mx: 'auto', p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack component="form" onSubmit={submit} spacing={3}>
        <Typography variant="h4" component="h1">Log in</Typography>
        {state?.notice && <Alert severity="info">{state.notice}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
        <TextField label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
        <Button type="submit" variant="contained" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
        <Typography>New here? <MuiLink component={Link} to="/register" state={{ from }}>Register</MuiLink></Typography>
      </Stack>
    </Paper>
  )
}


