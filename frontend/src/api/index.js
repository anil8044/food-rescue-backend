import { get, post, put, patch, del } from './client';

export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
};

export const usersApi = {
  create: (data) => post('/users', data),
  getById: (id) => get(`/users/${id}`),
  pending: () => get('/users/pending-verifications'),
  update: (id, data) => put(`/users/${id}`, data),
};

export const donationsApi = {
  all: () => get('/donations'),
  available: () => get('/donations/available'),
  byDonor: (donorId) => get(`/donations/donor/${donorId}`),
  create: (donorId, data) => post('/donations', data, { donorId }),
  setStatus: (id, status) => patch(`/donations/${id}/status`, undefined, { status }),
};

export const reservationsApi = {
  forRecipient: (recipientOrgId) => get(`/reservations/recipient/${recipientOrgId}`),
  create: (recipientOrgId, data) => post('/reservations', data, { recipientOrgId }),
  setStatus: (id, status) => patch(`/reservations/${id}/status`, undefined, { status }),
  cancel: (id) => del(`/reservations/${id}`),
};

export const incidentsApi = {
  flag: (donationId, reportedByUserId, data) =>
    post(`/donations/${donationId}/incidents`, data, { reportedByUserId }),
  all: () => get('/incidents'),
  byStatus: (status) => get(`/incidents/status/${status}`),
  setStatus: (id, status) => patch(`/incidents/${id}/status`, undefined, { status }),
  resolve: (id, body) => patch(`/incidents/${id}/resolve`, body),
  addNote: (id, note) => patch(`/incidents/${id}/notes`, { note }),
  report: (from, to) => get('/incidents/report', { from, to }),
};

export const notificationsApi = {
  unread: (userId) => get(`/notifications/user/${userId}/unread`),
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: (userId) => patch(`/notifications/user/${userId}/read-all`),
};

export const dashboardApi = {
  stats: () => get('/dashboard/stats'),
  userStats: (userId) => get(`/dashboard/user/${userId}/stats`),
};

export const missedApi = { summary: () => get('/missed-collections') };
