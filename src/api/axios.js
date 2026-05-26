// ─── AXIOS BASE CONFIGURATION ─────────────────────────
// Creates the base Axios instance used by all API calls
//
// baseURL is read from the VITE_API_URL environment
// variable which Vite bakes into the build at build time
//
// In development (.env):
//   VITE_API_URL=http://localhost:3000/api
//
// In production (Vercel environment variables):
//   VITE_API_URL=https://leavesync-api.onrender.com/api
//
// IMPORTANT: Vite only exposes variables that start
// with VITE_ to the browser — all others are hidden
// for security reasons

import axios from 'axios';

const api = axios.create({
  // Use the environment variable if set
  // Fall back to localhost only for local development
  baseURL: import.meta.env.VITE_API_URL
    || 'http://localhost:3000/api',

  // 30 second timeout — generous for Render cold starts
  // Render free tier can take 30+ seconds to wake up
  timeout: 30000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────
// Runs before every outgoing API request
// Automatically attaches the JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────
// Runs after every incoming API response
// Handles 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;