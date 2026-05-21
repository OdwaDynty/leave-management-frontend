// ─── REPORT API CALLS ─────────────────────────────────

import api from './axios';

// Company wide leave summary
// Optional: { year: 2026 }
export const getCompanySummary = (params) =>
  api.get('/reports/summary', { params });

// Single employee leave report
export const getEmployeeReport = (id, params) =>
  api.get(`/reports/employee/${id}`, { params });

// Team overview for managers
export const getTeamOverview = (params) =>
  api.get('/reports/team', { params });

// Absenteeism report
export const getAbsenteeismReport = (params) =>
  api.get('/reports/absenteeism', { params });

// Upcoming approved leave
// Optional: { days: 30 }
export const getUpcomingLeave = (params) =>
  api.get('/reports/upcoming', { params });