import { api } from './client'
export type Severity = 'MINOR' | 'MODERATE' | 'SEVERE'
export type Incident = { id: number; donationId: number; status: string; description: string; severity: Severity }
export function reportIncident(donationId: number, userId: number, description: string, severity: Severity) {
  return api<Incident>(`/donations/${donationId}/incidents?reportedByUserId=${userId}`, {
    method: 'POST', body: JSON.stringify({ description, severity }),
  })
}
