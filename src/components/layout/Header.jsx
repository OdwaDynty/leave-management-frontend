// ─── HEADER ───────────────────────────────────────────
// Top bar shown on every dashboard page
//
// Desktop: Shows page title, notification bell, user chip
// Mobile:  Shows hamburger menu button + page title + bell
//
// The onMenuClick prop is called when the hamburger
// button is tapped — it opens the sidebar drawer

import { useState, useEffect }  from 'react';
import { useLocation, Link }    from 'react-router-dom';
import { Bell, Menu }           from 'lucide-react';
import { useAuth }              from '../../context/AuthContext';
import { getNotifications }     from '../../api/notifications';
import Avatar                   from '../ui/Avatar';

// Map URL paths to human-readable page titles
const PAGE_TITLES = {
  '/dashboard':                  'Dashboard',
  '/dashboard/my-leave':         'My Leave Requests',
  '/dashboard/my-balances':      'My Leave Balances',
  '/dashboard/approvals':        'Pending Approvals',
  '/dashboard/employees':        'Employee Management',
  '/dashboard/leave-types':      'Leave Types',
  '/dashboard/leave-policies':   'Leave Policies',
  '/dashboard/calendar':         'Leave Calendar',
  '/dashboard/reports':          'Reports',
  '/dashboard/audit':            'Audit Trail',
  '/dashboard/holidays':         'Public Holidays',
  '/dashboard/notifications':    'Notifications',
  '/dashboard/role-requests':    'Role Change Request',
  '/dashboard/role-requests-admin': 'Pending Role Requests',
  '/dashboard/settings':         'Company Settings',
};

// ─── HEADER COMPONENT ─────────────────────────────────
// onMenuClick → called when hamburger button is tapped
const Header = ({ onMenuClick }) => {
  const { user }     = useAuth();
  const location     = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get the page title based on current URL
  const pageTitle =
    PAGE_TITLES[location.pathname] || 'Dashboard';

  // Full name for the avatar initials
  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : '';

  // ── Fetch Unread Notification Count ───────────────
  // Shows a red badge on the bell icon
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getNotifications({ is_read: false });
        setUnreadCount(res.data.unread || 0);
      } catch {
        // Silently fail — not critical
      }
    };
    fetchUnread();
  }, [location.pathname]); // Refresh on every page change

  return (
    <header style={styles.header}>
      {/* ── Left Side ── */}
      <div style={styles.leftSide}>

        {/* Hamburger menu — only visible on mobile */}
        {/* Tapping this opens the sidebar drawer   */}
        <button
          onClick={onMenuClick}
          style={styles.menuBtn}
          className="show-mobile"
          aria-label="Open navigation menu"
        >
          <Menu size={22} color="var(--gray-700)" />
        </button>

        {/* Page Title + Company Name */}
        <div>
          <h1 style={styles.pageTitle}>{pageTitle}</h1>
          <p style={styles.companyName}>
            {user?.company?.name || 'LeaveSync'}
          </p>
        </div>
      </div>

      {/* ── Right Side ── */}
      <div style={styles.rightSide}>

        {/* Notification Bell with unread badge */}
        <Link
          to="/dashboard/notifications"
          style={styles.bellWrap}
        >
          <Bell size={20} color="var(--gray-600)" />
          {/* Red badge shown when there are unread notifications */}
          {unreadCount > 0 && (
            <span style={styles.badge}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar + Name chip */}
        {/* Hidden on mobile to save space */}
        <div style={styles.userChip} className="hide-mobile">
          <Avatar name={fullName} size={32} />
          <div style={styles.userInfo}>
            <span style={styles.userName}>{fullName}</span>
            <span style={styles.userCompany}>
              {user?.company?.name}
            </span>
          </div>
        </div>

        {/* On mobile show only the avatar (no text) */}
        <div style={styles.avatarOnly} className="show-mobile">
          <Avatar name={fullName} size={32} />
        </div>
      </div>
    </header>
  );
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
  header: {
    height:         '64px',
    background:     'white',
    borderBottom:   '1px solid var(--gray-200)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 1.5rem',
    position:       'sticky',
    top:            0,
    zIndex:         10,
    flexShrink:     0,
  },
  leftSide: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.875rem',
  },
  menuBtn: {
    // Hamburger button styles
    background:   'transparent',
    border:       'none',
    cursor:       'pointer',
    padding:      '0.375rem',
    borderRadius: '0.5rem',
    display:      'flex',
    alignItems:   'center',
    // Only shown on mobile via show-mobile class
  },
  pageTitle: {
    fontSize:   '1.125rem',
    fontWeight: '600',
    color:      'var(--gray-900)',
    lineHeight: 1.2,
    // Truncate very long titles on small screens
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    maxWidth:     '200px',
  },
  companyName: {
    fontSize:  '0.75rem',
    color:     'var(--gray-400)',
    marginTop: '0.1rem',
  },
  rightSide: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
  },
  bellWrap: {
    position:     'relative',
    display:      'flex',
    alignItems:   'center',
    padding:      '0.5rem',
    borderRadius: '0.5rem',
    background:   'var(--gray-50)',
    border:       '1px solid var(--gray-200)',
    cursor:       'pointer',
    color:        'inherit',
  },
  badge: {
    // Red unread count badge on the bell
    position:       'absolute',
    top:            '-4px',
    right:          '-4px',
    background:     '#EF4444',
    color:          'white',
    fontSize:       '0.625rem',
    fontWeight:     '700',
    borderRadius:   '9999px',
    minWidth:       '16px',
    height:         '16px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '0 3px',
  },
  userChip: {
    // User name chip — hidden on mobile
    display:      'flex',
    alignItems:   'center',
    gap:          '0.625rem',
    padding:      '0.375rem 0.75rem',
    background:   'var(--gray-50)',
    border:       '1px solid var(--gray-200)',
    borderRadius: '2rem',
    cursor:       'default',
  },
  userInfo: {
    display:       'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize:   '0.8125rem',
    fontWeight: '600',
    color:      'var(--gray-800)',
    lineHeight: 1.2,
  },
  userCompany: {
    fontSize:  '0.6875rem',
    color:     'var(--gray-400)',
    lineHeight:1.2,
  },
  avatarOnly: {
    // Show only avatar on mobile (no text)
    // Shown via show-mobile CSS class
  },
};

export default Header;