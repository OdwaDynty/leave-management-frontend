// ─── COMPANY API CALLS ────────────────────────────────
// Functions for company settings management

import api from './axios';

// Get the current company's settings and stats
export const getCompanySettings = () =>
  api.get('/company/settings');

// Update company settings
// Only super_admin can call this
export const updateCompanySettings = (data) =>
  api.put('/company/settings', data);