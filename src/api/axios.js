// ─── AXIOS BASE CONFIGURATION ─────────────────────────
// Creates the base Axios instance used by all API calls
//
// baseURL tells Axios where to send all requests
// In development: http://localhost:3000/api
// In production:  your Render backend URL
//
// VITE_API_URL is read from .env files
// Vite requires all environment variables to start
// with VITE_ otherwise they are hidden from the browser
// for security reasons

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    || 'http://localhost:3000/api',
  // Set a timeout so requests do not hang forever
  // 30 seconds is generous enough for the Render
  // free tier which can be slow on cold starts
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────
// Runs before every outgoing API request
// Automatically attaches the JWT token from localStorage
// so we do not need to manually add it in every API call
api.interceptors.request.use(
  (config) => {
    // Read the token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Attach token as Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────
// Runs after every incoming API response
// Handles 401 Unauthorized globally — logs the user out
// if their token has expired or is invalid
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // Handle token expiry
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle Render cold start timeout
    // When the server is waking up requests may timeout
    // We show a helpful message instead of a generic error
    if (error.code === 'ECONNABORTED' ||
        error.message === 'Network Error') {
      console.log(
        'Server is starting up, please wait...'
      );
    }

    return Promise.reject(error);
  }
);

export default api;