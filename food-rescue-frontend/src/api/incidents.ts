import { api } from './client'

export type IncidentStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH'

export type Incident = {
  id: number
  donationId: number
  donationTitle: string | null
  donationDescription: string | null
  donorId: number
  donorName: string | null
  donorOrganisation: string | null
  reportedById: number
  reportedByName: string | null
  reportedByOrganisation: string | null
  reporterRole: string | null
  description: string
  additionalNotes: string | null
  severity: IncidentSeverity
  status: IncidentStatus
  reportedAt: string
  resolvedAt: string | null
  resolutionNotes: string | null
  donorFollowUp: string | null
  adminNotes: string | null
}

export type IncidentReport = {
  from: string
  to: string
  totalIncidents: number
  incidentsBySeverity: Record<string, number>
  incidentsByStatus: Record<string, number>
  incidents: Incident[]
}

export type ResolutionRequest = {
  resolutionNotes: string
  resolvedOn: string
  donorFollowUp?: string
}

export function getIncidents(
  status?: IncidentStatus,
  signal?: AbortSignal
) {
  const path = status
    ? `/incidents/status/${status}`
    : '/incidents'

  return api<Incident[]>(path, { signal })
}

export function markIncidentUnderReview(id: number) {
  return api<Incident>(
    `/incidents/${id}/status?status=UNDER_REVIEW`,
    { method: 'PATCH' }
  )
}

export function resolveIncident(
  id: number,
  request: ResolutionRequest
) {
  return api<Incident>(`/incidents/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function getIncidentReport(
  from: string,
  to: string,
  signal?: AbortSignal
) {
  const query = new URLSearchParams({ from, to })

  return api<IncidentReport>(
    `/incidents/report?${query.toString()}`,
    { signal }
  )
}