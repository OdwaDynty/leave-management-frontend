// ─── DASHBOARD LAYOUT ─────────────────────────────────
// The main shell that wraps every dashboard page
// Contains the Sidebar, Header, and page content area
//
// Manages the mobile sidebar open/close state
// Passes isOpen and onClose to Sidebar
// Passes onMenuClick to Header

import { useState, useEffect } from 'react';
import { useLocation }         from 'react-router-dom';
import { Outlet }              from 'react-router-dom';
import Sidebar                 from './Sidebar';
import Header                  from './Header';

const DashboardLayout = () => {
  // ── Mobile Sidebar State ───────────────────────────
  // Controls whether the sidebar drawer is open on mobile
  // Starts closed (false) on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  // ── Auto-close Sidebar on Route Change ────────────
  // When the user taps a nav link on mobile the sidebar
  // closes automatically after navigation
  // This runs every time the URL changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ── Prevent Body Scroll When Sidebar Open ─────────
  // When the sidebar drawer is open on mobile we prevent
  // the page behind it from scrolling
  useEffect(() => {
    if (sidebarOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    // Cleanup: always restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div style={styles.shell}>
      {/* ── Sidebar ── */}
      {/* Receives open state and close handler */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main Content Area ── */}
      <div style={styles.main}>
        {/* Header receives the menu button handler */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content renders here via React Router */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
  shell: {
    display:   'flex',
    minHeight: '100vh',
    background:'var(--gray-50)',
  },
  main: {
    // Takes all remaining width after sidebar
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    // Prevents content from overflowing on mobile
    minWidth:      0,
    overflowX:     'hidden',
  },
  content: {
    flex:    1,
    // More padding on desktop, less on mobile
    padding: 'clamp(1rem, 3vw, 1.5rem)',
  },
};

export default DashboardLayout;