// ─── APP ENTRY POINT ──────────────────────────────────
// The root file that mounts React to the DOM
// Wraps everything with AuthProvider and BrowserRouter

import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster }     from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App             from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter enables React Router navigation */}
    <BrowserRouter>
      {/* AuthProvider gives all components access to auth state */}
      <AuthProvider>
        {/* Toaster shows success/error toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color:      '#F9FAFB',
              fontSize:   '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F9FAFB',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F9FAFB',
              },
            },
          }}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);