// ─── AXIOS BASE CLIENT ────────────────────────────────
// Creates a pre-configured axios instance that all API
// calls use. This means we only define the base URL and
// auth header logic once — not in every component.

import axios from 'axios';

// Create the axios instance with our API base URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Our Express API
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────
// Runs before every request is sent
// Automatically attaches the JWT token to every request
// so we don't have to add it manually in every API call
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If a token exists attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────
// Runs after every response is received
// Handles global errors like expired tokens
api.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  (error) => {
    // If the server returns 401 (Unauthorized) the token
    // has expired or is invalid — log the user out
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;