import { api } from './client'
export type Reservation = {
  id: number; donationId: number; donationTitle: string; recipientOrgId: number
  recipientOrgName: string; status: 'PENDING' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED'
  scheduledPickupTime: string | null; reservedAt: string; collectedAt: string | null
}
export function createReservation(recipientOrgId: number, donationId: number, scheduledPickupTime?: string) {
  return api<Reservation>(`/reservations?recipientOrgId=${recipientOrgId}`, {
    method: 'POST', body: JSON.stringify({ donationId, scheduledPickupTime }),
  })
}


export function getMyReservations(userId: number, signal?: AbortSignal) {
  return api<Reservation[]>(`/reservations/recipient/${userId}`, { signal })
}
export function collectReservation(id: number) {
  return api<Reservation>(`/reservations/${id}/status?status=COLLECTED`, { method: 'PATCH' })
}
export function cancelReservation(id: number) {
  return api<void>(`/reservations/${id}`, { method: 'DELETE' })
}
