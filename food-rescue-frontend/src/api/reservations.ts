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

