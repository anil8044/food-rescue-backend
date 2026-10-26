export function homePathFor(role) {
  return { DONOR: '/donor', RECIPIENT_ORG: '/recipient', ADMIN: '/admin' }[role] || '/login';
}

export function roleLabel(role) {
  return { DONOR: 'Donor', RECIPIENT_ORG: 'Recipient organisation', ADMIN: 'Administrator' }[role] || role;
}

export const NAV_ITEMS = {
  DONOR: [{ to: '/donor', label: 'Donate food' }],
  RECIPIENT_ORG: [
    { to: '/recipient', label: 'Browse donations' },
    { to: '/recipient/reservations', label: 'My reservations' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/incidents', label: 'Incidents' },
    { to: '/admin/recipients', label: 'Recipient approvals' },
    { to: '/admin/report', label: 'Incident report' },
  ],
};
