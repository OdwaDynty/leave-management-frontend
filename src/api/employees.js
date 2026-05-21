// ─── EMPLOYEE API CALLS ───────────────────────────────

import api from './axios';

// Add a new employee to the company
export const addEmployee = (data) =>
  api.post('/employees', data);

// List all employees — optional filters as query params
// e.g. listEmployees({ department: 'Engineering', is_active: true })
export const listEmployees = (params) =>
  api.get('/employees', { params });

// Get a single employee by ID
export const getEmployee = (id) =>
  api.get(`/employees/${id}`);

// Update an employee's details
export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, data);

// Deactivate an employee
export const deactivateEmployee = (id) =>
  api.delete(`/employees/${id}`);

// Reactivate a deactivated employee
export const reactivateEmployee = (id) =>
  api.put(`/employees/${id}/reactivate`);