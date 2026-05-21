// ─── ROLE REQUEST API CALLS ───────────────────────────
// Functions for the self-service promotion workflow
// Employees submit requests, HR approves or rejects

import api from './axios';

// Employee submits a promotion request
// Body: { requested_role, reason }
export const submitRoleRequest = (data) =>
  api.post('/role-requests', data);

// Employee views their own request history
export const getMyRoleRequests = () =>
  api.get('/role-requests/my');

// HR views all pending role requests company-wide
export const getPendingRoleRequests = () =>
  api.get('/role-requests/pending');

// HR approves a role request
// Body: { approval_note } (optional)
export const approveRoleRequest = (id, data) =>
  api.put(`/role-requests/${id}/approve`, data);

// HR rejects a role request
// Body: { rejection_reason } (required)
export const rejectRoleRequest = (id, data) =>
  api.put(`/role-requests/${id}/reject`, data);