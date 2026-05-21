// ─── LEAVE TYPE API CALLS ─────────────────────────────

import api from './axios';

// Create a new leave type
export const createLeaveType = (data) =>
  api.post('/leave-types', data);

// List all leave types for the company
export const listLeaveTypes = (params) =>
  api.get('/leave-types', { params });

// Get a single leave type by ID
export const getLeaveType = (id) =>
  api.get(`/leave-types/${id}`);

// Update a leave type
export const updateLeaveType = (id, data) =>
  api.put(`/leave-types/${id}`, data);

// Deactivate a leave type
export const deactivateLeaveType = (id) =>
  api.delete(`/leave-types/${id}`);