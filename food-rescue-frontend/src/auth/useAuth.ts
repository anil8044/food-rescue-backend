import { createContext, useContext } from 'react'
import type { User } from './session'
type Auth = { user: User | null; login: (user: User) => void; logout: () => void }
export const AuthContext = createContext<Auth | null>(null)
export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('AuthProvider is missing')
  return auth
}
