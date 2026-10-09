export type Role = 'DONOR' | 'RECIPIENT_ORG' | 'ADMIN'
export type User = {
  id: number; fullName: string; email: string; role: Role
  organisationName: string | null; phoneNumber: string | null; address: string | null
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null; createdAt: string
}
export const SESSION_KEY = 'food-rescue-session'
export const IDLE_MS = 600_000
export type Session = { user: User; expiresAt: number }
export function readSession(): Session | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as Session | null
    if (!value || !Number.isFinite(value.expiresAt) || !value.user ||
      !Number.isInteger(value.user.id) || !['DONOR', 'RECIPIENT_ORG', 'ADMIN'].includes(value.user.role)) return null
    return value
  } catch { return null }
}
export function safeReturnTo(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') ||
    value.includes('\\') || /^\/(login|register)(?:[/?#]|$)/.test(value)) return '/'
  return value
}
export function canVisit(path: string, role: Role): boolean {
  const pathname = path.split(/[?#]/)[0]
  const required = /^\/(donor|recipient|admin)(?:\/|$)/.exec(pathname)?.[1]
  return !required || ({ donor: 'DONOR', recipient: 'RECIPIENT_ORG', admin: 'ADMIN' } as Record<string, Role>)[required] === role
}

