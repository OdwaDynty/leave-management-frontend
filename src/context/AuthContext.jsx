// ─── AUTH CONTEXT ─────────────────────────────────────
// Global authentication state for the entire app
//
// KEY FIX: loginUser now accepts { email, password }
// and handles the API call internally — this matches
// how LoginPage calls it:
//   const res = await loginUser({ email, password })
//
// The old version accepted (token, userData) which
// did not match how LoginPage was calling it

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { login as loginApi } from '../api/auth';

// Create the context — null is the default before
// the Provider mounts
const AuthContext = createContext(null);

// ─── AUTH PROVIDER ────────────────────────────────────
export const AuthProvider = ({ children }) => {

  // The logged in user object — null means not logged in
  const [user,      setUser]      = useState(null);

  // True while we are checking localStorage on startup
  // ProtectedRoute waits for this to be false before
  // deciding whether to show the page or redirect
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore Session on Page Load ──────────────────
  // Checks localStorage for a saved token and user
  // This keeps users logged in when they refresh the page
  // We do NOT call the API here — we just read localStorage
  // This is instant and does not depend on Render being awake
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser  = localStorage.getItem('user');

      if (savedToken && savedUser) {
        // Restore the saved user object
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (err) {
      // If localStorage data is corrupted clear it
      console.error('Session restore error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      // Always set loading to false when done
      // Even if there was no saved session
      setIsLoading(false);
    }
  }, []); // Empty array = only runs once on mount

  // ── Login Function ─────────────────────────────────
  // Accepts { email, password } and calls the login API
  // Returns { success: true } or { success: false, error }
  //
  // This is what LoginPage calls:
  //   const res = await loginUser({ email, password })
  //   if (res.success) navigate('/dashboard')
  const loginUser = async ({ email, password }) => {
    try {
      // Call the login API endpoint
      const res = await loginApi({ email, password });

      // API returns { token, user }
      const { token, user: userData } = res.data;

      // Save to localStorage so session survives refresh
      localStorage.setItem('token', token);
      localStorage.setItem(
        'user', JSON.stringify(userData)
      );

      // Update React state so UI re-renders
      setUser(userData);

      // Tell LoginPage the login succeeded
      return { success: true };

    } catch (err) {
      // Extract the error message from the API response
      const message =
        err.response?.data?.error   ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';

      // Tell LoginPage what went wrong
      return { success: false, error: message };
    }
  };

  // ── Logout Function ────────────────────────────────
  // Clears session and redirects to login page
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // ── Has Role Helper ────────────────────────────────
  // Checks if current user has a specific role or roles
  // Used by RoleRoute and Sidebar to show/hide content
  //
  // Examples:
  //   hasRole('manager')
  //   hasRole(['manager', 'hr_admin', 'super_admin'])
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // ── Context Value ──────────────────────────────────
  // Everything available to child components via useAuth()
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginUser,
    logoutUser,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── USE AUTH HOOK ────────────────────────────────────
// Custom hook — import this in any component that needs
// auth state
// Usage: const { user, loginUser, logoutUser } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider. '
      + 'Wrap your app in <AuthProvider> in main.jsx'
    );
  }

  return context;
};

export default AuthContext;