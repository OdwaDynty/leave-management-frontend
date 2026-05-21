// ─── LEAVE REQUEST API CALLS ──────────────────────────

import api from './axios';

// Submit a new leave request
export const submitLeaveRequest = (data) =>
  api.post('/leave-requests', data);

// Get the logged in employee's own requests
// Optional filters: { status: 'pending', year: 2026 }
export const getMyLeaveRequests = (params) =>
  api.get('/leave-requests/my', { params });

// Manager views all pending approvals
export const getPendingApprovals = () =>
  api.get('/leave-requests/pending');

// Get a single leave request by ID
export const getLeaveRequest = (id) =>
  api.get(`/leave-requests/${id}`);

// Approve a leave request
export const approveLeaveRequest = (id) =>
  api.put(`/leave-requests/${id}/approve`);

// Reject a leave request with a reason
export const rejectLeaveRequest = (id, data) =>
  api.put(`/leave-requests/${id}/reject`, data);

// Cancel a leave request
export const cancelLeaveRequest = (id) =>
  api.put(`/leave-requests/${id}/cancel`);

// Get the leave calendar for a given month
// e.g. getLeaveCalendar({ month: 6, year: 2026 })
export const getLeaveCalendar = (params) =>
  api.get('/leave-requests/calendar', { params });