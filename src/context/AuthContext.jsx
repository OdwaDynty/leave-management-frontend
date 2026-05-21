// ─── AUTH CONTEXT ─────────────────────────────────────
// Global authentication state for the entire app
// Wraps the app so any component can access:
//   - user        → the logged in user object
//   - token       → the JWT token
//   - login()     → log in function
//   - logout()    → log out function
//   - isLoading   → whether auth state is being checked

import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/auth';

// Create the context
const AuthContext = createContext(null);

// ─── AUTH PROVIDER ────────────────────────────────────
// Wrap the entire app with this so all components can
// access auth state via the useAuth() hook
export const AuthProvider = ({ children }) => {
  // The logged in user object (null if not logged in)
  const [user, setUser]         = useState(null);

  // Whether we are currently checking if user is logged in
  const [isLoading, setIsLoading] = useState(true);

  // ── On App Load ────────────────────────────────────
  // Check if there is a saved token in localStorage
  // If so fetch the user's profile to restore their session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Fetch fresh user data from the API
          const response = await getProfile();
          setUser(response.data.user);
        } catch (err) {
          // Token is invalid or expired — clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // Done checking — hide the loading screen
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // ── Login ──────────────────────────────────────────
  // Called after a successful login API response
  // Saves the token and user to state and localStorage
  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // ── Logout ─────────────────────────────────────────
  // Clears everything and sends user to login page
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // ── Helper: Check Role ─────────────────────────────
  // Convenience function to check if the user has a role
  // e.g. hasRole('hr_admin') or hasRole(['manager', 'hr_admin'])
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user, // true if user is not null
      loginUser,
      logoutUser,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── useAuth HOOK ─────────────────────────────────────
// Custom hook to access auth context in any component
// Usage: const { user, loginUser, logoutUser } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

export default AuthContext;