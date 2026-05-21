// ─── PUBLIC HOLIDAY API CALLS ─────────────────────────

import api from './axios';

// Seed SA public holidays for a given year
export const seedHolidays = (data) =>
  api.post('/public-holidays/seed', data);

// Add a custom holiday
export const addHoliday = (data) =>
  api.post('/public-holidays', data);

// List all holidays
// Optional: { year: 2026 }
export const listHolidays = (params) =>
  api.get('/public-holidays', { params });

// Delete a holiday
export const deleteHoliday = (id) =>
  api.delete(`/public-holidays/${id}`);