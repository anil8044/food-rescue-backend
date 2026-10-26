import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IDLE_MS, SESSION_KEY, readSession, type Session, type User } from './session'
import { AuthContext } from './useAuth'
import { startIdleTimer } from './idleTimer'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())
  const current = useRef(session)
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname + location.search + location.hash

  const clear = useCallback(() => {
    current.current = null
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const login = useCallback((user: User) => {
    const next = { user, expiresAt: Date.now() + IDLE_MS }
    current.current = next
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clear()
    navigate('/', { replace: true })
  }, [clear, navigate])

  useEffect(() => {
    if (!session || !current.current) return
    return startIdleTimer({
      expiresAt: current.current.expiresAt,
      idleMs: IDLE_MS,
      activityTarget: window,
      visibilityTarget: document,
      refresh: (expiresAt) => {
        if (!current.current) return
        current.current = { ...current.current, expiresAt }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(current.current))
      },
      expire: () => {
        clear()
        navigate('/login', { replace: true, state: { from: path, notice: '登录已过期，请重新登录' } })
      },
    })
  }, [session, clear, navigate, path])

  return <AuthContext.Provider value={{ user: session?.user ?? null, login, logout }}>{children}</AuthContext.Provider>
}

