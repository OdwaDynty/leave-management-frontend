// ─── SIDEBAR ──────────────────────────────────────────
// Navigation sidebar that works on both desktop and mobile
//
// Desktop behaviour:
//   Always visible on the left side of the screen
//   Fixed width defined by --sidebar-width CSS variable
//
// Mobile behaviour:
//   Hidden by default (slides off-screen to the left)
//   Opens as a drawer when the hamburger button is tapped
//   Dark overlay covers the page content behind it
//   Closes when user taps a link or the overlay
//
// The isOpen and onClose props are controlled by
// DashboardLayout which manages the open/close state

import { NavLink }  from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import Avatar       from '../ui/Avatar';
import {
  LayoutDashboard, Users, Calendar,
  FileText, Bell, BarChart2, Settings,
  LogOut, CheckSquare, Wallet, Sun,
  ClipboardList, TrendingUp, Building,
  CreditCard,
  X,
} from 'lucide-react';

// ─── NAV ITEMS ────────────────────────────────────────
// Each item defines a sidebar link
// roles: null = visible to all authenticated users
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon:  LayoutDashboard,
    path:  '/dashboard',
    roles: null,
    end:   true, // Only match exact /dashboard URL
  },
  {
    label: 'My Leave',
    icon:  FileText,
    path:  '/dashboard/my-leave',
    roles: null,
  },
  {
    label: 'My Balances',
    icon:  Wallet,
    path:  '/dashboard/my-balances',
    roles: null,
  },
  {
    label: 'My Role Request',
    icon:  TrendingUp,
    path:  '/dashboard/role-requests',
    roles: null,
  },
  {
    label: 'Approvals',
    icon:  CheckSquare,
    path:  '/dashboard/approvals',
    // Only managers and above see this
    roles: ['manager', 'hr_admin', 'super_admin'],
  },
  {
    label: 'Role Requests',
    icon:  Users,
    path:  '/dashboard/role-requests-admin',
    // Only HR admins see this
    roles: ['hr_admin', 'super_admin'],
  },
  {
    label: 'Employees',
    icon:  Users,
    path:  '/dashboard/employees',
    roles: ['manager', 'hr_admin', 'super_admin'],
  },
  {
    label: 'Leave Types',
    icon:  ClipboardList,
    path:  '/dashboard/leave-types',
    roles: ['hr_admin', 'super_admin'],
  },
  {
    label: 'Leave Policies',
    icon:  Settings,
    path:  '/dashboard/leave-policies',
    roles: ['hr_admin', 'super_admin'],
  },
  {
    label: 'Calendar',
    icon:  Calendar,
    path:  '/dashboard/calendar',
    roles: null,
  },
  {
    label: 'Reports',
    icon:  BarChart2,
    path:  '/dashboard/reports',
    roles: ['manager', 'hr_admin', 'super_admin'],
  },
  {
    label: 'Audit Trail',
    icon:  ClipboardList,
    path:  '/dashboard/audit',
    roles: ['hr_admin', 'super_admin'],
  },
  {
    label: 'Public Holidays',
    icon:  Sun,
    path:  '/dashboard/holidays',
    roles: ['hr_admin', 'super_admin'],
  },
  {
    label: 'Notifications',
    icon:  Bell,
    path:  '/dashboard/notifications',
    roles: null,
  },
  {
    label: 'Company Settings',
    icon:  Building,
    path:  '/dashboard/settings',
    roles: null,
  },

  {
    label: 'Billing and Plans',
    icon:  CreditCard,
    path:  '/dashboard/billing',
    // All users can view but only super_admin can upgrade
    roles: null,
   },
];

// ─── SIDEBAR COMPONENT ────────────────────────────────
// isOpen  → whether the sidebar is visible on mobile
// onClose → function to call when closing on mobile
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logoutUser, hasRole } = useAuth();

  // Build the user's full name for the avatar
  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : '';

  // Human-readable role label
  const roleLabel = {
    employee:    'Employee',
    manager:     'Manager',
    hr_admin:    'HR Admin',
    super_admin: 'Super Admin',
  }[user?.role] || user?.role;

  return (
    <>
      {/* ── Mobile Overlay ── */}
      {/* Dark backdrop shown behind sidebar on mobile */}
      {/* Tapping it closes the sidebar */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar Panel ── */}
      <aside style={{
        ...styles.sidebar,
        // On mobile: slide in/out based on isOpen state
        // On desktop: always visible (transform has no effect)
        transform: isOpen
          ? 'translateX(0)'
          : undefined,
      }}
        // Apply the correct mobile class
        className={isOpen
          ? 'sidebar-mobile-visible'
          : 'sidebar-mobile-hidden'
        }
      >
        {/* ── Logo + Mobile Close Button ── */}
        <div style={styles.logo}>
          {/* LeaveSync logo */}
          <div style={styles.logoIcon}>LS</div>
          <span style={styles.logoText}>LeaveSync</span>

          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            style={styles.closeBtn}
            className="show-mobile"
            aria-label="Close menu"
          >
            <X size={18} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* ── Navigation Links ── */}
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            // Skip items the user's role cannot access
            if (item.roles && !hasRole(item.roles)) {
              return null;
            }

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                // Close sidebar on mobile when link is tapped
                onClick={onClose}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  // Highlight the active page
                  ...(isActive ? styles.navItemActive : {}),
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ── User Profile at Bottom ── */}
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            {/* Avatar circle with user initials */}
            <Avatar name={fullName} size={36} />
            <div style={styles.userText}>
              <div style={styles.userName}>{fullName}</div>
              <div style={styles.userRole}>{roleLabel}</div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logoutUser}
            style={styles.logoutBtn}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
  sidebar: {
    width:         'var(--sidebar-width)',
    minWidth:      '260px',
    minHeight:     '100vh',
    background:    '#1E1B4B',
    display:       'flex',
    flexDirection: 'column',
    flexShrink:    0,
    // Sticky so it stays in view while scrolling
    position:      'sticky',
    top:           0,
    overflowY:     'auto',
    // Transition for smooth mobile slide animation
    transition:    'transform 0.3s ease',
    // On mobile: fixed position so it overlays the content
    // On desktop: sticky (handled by media query in CSS)
    zIndex:        50,
  },
  logo: {
    display:     'flex',
    alignItems:  'center',
    gap:         '0.75rem',
    padding:     '1.5rem 1.25rem',
    borderBottom:'1px solid rgba(255,255,255,0.08)',
    flexShrink:  0,
  },
  logoIcon: {
    width:          '36px',
    height:         '36px',
    background:     '#4F46E5',
    borderRadius:   '0.5rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          'white',
    fontWeight:     '700',
    fontSize:       '0.875rem',
    flexShrink:     0,
  },
  logoText: {
    color:      'white',
    fontWeight: '700',
    fontSize:   '1.125rem',
    flex:       1,
  },
  closeBtn: {
    background:   'transparent',
    border:       'none',
    cursor:       'pointer',
    padding:      '0.25rem',
    borderRadius: '0.375rem',
    display:      'flex',
    alignItems:   'center',
    flexShrink:   0,
  },
  nav: {
    flex:          1,
    padding:       '1rem 0.75rem',
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.25rem',
    overflowY:     'auto',
  },
  navItem: {
    display:       'flex',
    alignItems:    'center',
    gap:           '0.75rem',
    padding:       '0.625rem 0.875rem',
    borderRadius:  '0.5rem',
    color:         'rgba(255,255,255,0.65)',
    fontSize:      '0.875rem',
    fontWeight:    '500',
    textDecoration:'none',
    transition:    'all 0.15s',
    cursor:        'pointer',
  },
  navItemActive: {
    background: 'rgba(79,70,229,0.3)',
    color:      'white',
  },
  userSection: {
    padding:        '1rem 1.25rem',
    borderTop:      '1px solid rgba(255,255,255,0.08)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            '0.75rem',
    flexShrink:     0,
  },
  userInfo: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
    overflow:   'hidden',
  },
  userText: {
    overflow: 'hidden',
  },
  userName: {
    color:        'white',
    fontSize:     '0.875rem',
    fontWeight:   '600',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  },
  userRole: {
    color:     'rgba(255,255,255,0.5)',
    fontSize:  '0.75rem',
    marginTop: '0.1rem',
  },
  logoutBtn: {
    background:   'transparent',
    border:       'none',
    color:        'rgba(255,255,255,0.5)',
    cursor:       'pointer',
    padding:      '0.5rem',
    borderRadius: '0.375rem',
    display:      'flex',
    alignItems:   'center',
    flexShrink:   0,
    transition:   'all 0.15s',
  },
};

export default Sidebar;