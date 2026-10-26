import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Role } from './session'

// Wrap team role pages with this boundary when they are integrated.
export default function RoleBoundary({ role }: { role: Role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  if (user.role !== role) return <Navigate to="/" replace state={{ denied: true }} />
  return <Outlet />
}


