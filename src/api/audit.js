// ─── AUDIT API CALLS ──────────────────────────────────
// Functions for reading the audit trail
// Only hr_admin and super_admin can call these

import api from './axios';

// Get the full company audit log
// Optional filters: action_type, user_id, from, to, limit
// e.g. getAuditLog({ action_type: 'ROLE_CHANGED', limit: 50 })
export const getAuditLog = (params) =>
  api.get('/audit', { params });

// Get audit history for one specific employee
// Shows all actions performed BY or ON that employee
export const getEmployeeAuditHistory = (id) =>
  api.get(`/audit/employee/${id}`);

// Get all distinct action types recorded in the log
// Used to populate the filter dropdown
export const getActionTypes = () =>
  api.get('/audit/action-types');