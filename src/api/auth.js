// ─── AUTH API CALLS ───────────────────────────────────
// Functions for register, login, and getting profile

import api from './axios';

// Register a new company and admin user
export const register = (data) =>
  api.post('/auth/register', data);

// Login with email and password
// Returns a JWT token and user object
export const login = (data) =>
  api.post('/auth/login', data);

// Get the currently logged in user's profile
export const getProfile = () =>
  api.get('/auth/me');

// Step 1: User submits email to request a reset link
export const forgotPassword = (data) =>
  api.post('/auth/forgot-password', data);

// Step 2: User submits token + new password to reset
export const resetPassword = (data) =>
  api.post('/auth/reset-password', data);