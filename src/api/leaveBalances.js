// ─── LEAVE BALANCE API CALLS ──────────────────────────

import api from './axios';

// Assign a leave balance to an employee
export const assignLeaveBalance = (data) =>
  api.post('/leave-balances/assign', data);

// Get the logged in employee's own balances
// Optional: pass { year: 2026 } as params
export const getMyBalances = (params) =>
  api.get('/leave-balances/my', { params });

// HR views any employee's balances
export const getEmployeeBalances = (id, params) =>
  api.get(`/leave-balances/employee/${id}`, { params });

// Manually adjust a leave balance
export const adjustLeaveBalance = (id, data) =>
  api.put(`/leave-balances/${id}`, data);

// Run year end carry over
export const runCarryOver = (data) =>
  api.post('/leave-balances/carry-over', data);