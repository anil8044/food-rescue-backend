import { api } from './client'
import type { Role, User } from '../auth/session'
export type RegisterRequest = {
  fullName: string; email: string; password: string; role: Exclude<Role, 'ADMIN'>
  organisationName?: string; phoneNumber?: string; address?: string
}
export function loginUser(email: string, password: string) {
  return api<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}
export function registerUser(request: RegisterRequest) {
  return api<User>('/users', { method: 'POST', body: JSON.stringify(request) })
}

