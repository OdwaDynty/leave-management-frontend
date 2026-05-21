// ─── LEAVE POLICY API CALLS ───────────────────────────
// Functions for managing role-based leave entitlements
// Only hr_admin and super_admin can call these

import api from './axios';

// Create a new role-based leave policy
// e.g. Annual Leave → manager → 20 days
export const createPolicy = (data) =>
  api.post('/leave-policies', data);

// List all leave policies for the company
export const listPolicies = () =>
  api.get('/leave-policies');

// Update the entitled days for an existing policy
export const updatePolicy = (id, data) =>
  api.put(`/leave-policies/${id}`, data);

// Auto-assign leave balances to all employees
// based on their role and the configured policies
// e.g. auto-assign for year 2027
export const autoAssignBalances = (data) =>
  api.post('/leave-policies/auto-assign', data);