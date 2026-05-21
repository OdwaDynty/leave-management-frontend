// ─── NOTIFICATIONS PAGE ───────────────────────────────
// Shows all notifications for the logged in user
// Users can mark as read or delete notifications

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format }              from 'date-fns';
import {
  Bell, CheckCheck, Trash2,
  CheckCircle, XCircle, FileText,
} from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../api/notifications';

// ─── NOTIFICATION ICON ────────────────────────────────
// Returns different icon and colour per notification type
const NotifIcon = ({ type }) => {
  const config = {
    request_submitted: {
      icon:  FileText,
      bg:    '#EEF2FF',
      color: '#4F46E5',
    },
    request_approved: {
      icon:  CheckCircle,
      bg:    '#D1FAE5',
      color: '#10B981',
    },
    request_rejected: {
      icon:  XCircle,
      bg:    '#FEE2E2',
      color: '#EF4444',
    },
  }[type] || {
    icon:  Bell,
    bg:    '#F3F4F6',
    color: '#6B7280',
  };

  const Icon = config.icon;

  return (
    <div style={{
      width:          '40px',
      height:         '40px',
      borderRadius:   '50%',
      background:     config.bg,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexShrink:     0,
    }}>
      <Icon size={18} color={config.color} />
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [filter,        setFilter]        = useState('all');
  const [deletingId,    setDeletingId]    = useState(null);

  // ── Fetch Notifications ────────────────────────────
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const params = filter === 'unread'
        ? { is_read: false } : {};
      const res = await getNotifications(params);
      setNotifications(res.data.notifications || []);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  // ── Unread Count ───────────────────────────────────
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Mark Single as Read ────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      // Update locally without refetching
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  // ── Mark All as Read ───────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      const res = await markAllAsRead();
      toast.success(res.data.message);
      // Mark all as read locally
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  // ── Delete Notification ────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
      // Remove from list immediately
      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );
      toast.success('Notification deleted.');
    } catch {
      toast.error('Failed to delete notification.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Notifications</h2>
          <p style={styles.pageSub}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All notifications read'}
          </p>
        </div>

        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <button
            className="btn btn-secondary"
            onClick={handleMarkAllRead}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={styles.tabs}>
        {['all', 'unread'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              ...styles.tab,
              ...(filter === tab ? styles.tabActive : {}),
            }}
          >
            {tab === 'all' ? 'All' : 'Unread'}
            {tab === 'unread' && unreadCount > 0 && (
              <span style={styles.tabBadge}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notifications List ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>

        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div style={styles.emptyIconWrap}>
              <Bell size={32} color="#9CA3AF" />
            </div>
            <p style={{ fontWeight: 600 }}>
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications yet'}
            </p>
            <p style={{ fontSize: '0.875rem',
                        color: 'var(--gray-400)' }}>
              {filter === 'unread'
                ? 'You are all caught up!'
                : 'Notifications will appear here when there is activity.'}
            </p>
          </div>

        ) : (
          <div>
            {notifications.map((notif, index) => (
              <div
                key={notif.id}
                style={{
                  ...styles.notifItem,
                  // Unread notifications have a light blue tint
                  background: notif.is_read
                    ? 'white'
                    : '#F5F8FF',
                  // No border on last item
                  borderBottom: index < notifications.length - 1
                    ? '1px solid var(--gray-100)'
                    : 'none',
                }}
              >
                {/* Unread Indicator Dot */}
                {!notif.is_read && (
                  <div style={styles.unreadDot} />
                )}

                {/* Notification Icon */}
                <NotifIcon type={notif.type} />

                {/* Notification Content */}
                <div style={styles.notifContent}>
                  <p style={{
                    ...styles.notifMessage,
                    fontWeight: notif.is_read ? 400 : 600,
                  }}>
                    {notif.message}
                  </p>
                  <p style={styles.notifTime}>
                    {format(
                      new Date(notif.created_at),
                      'dd MMM yyyy · HH:mm'
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div style={styles.notifActions}>
                  {/* Mark as read — only show if unread */}
                  {!notif.is_read && (
                    <button
                      style={styles.actionBtn}
                      onClick={() => handleMarkRead(notif.id)}
                      title="Mark as read"
                    >
                      <CheckCheck size={15}
                        color="var(--primary)" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    style={styles.actionBtn}
                    onClick={() => handleDelete(notif.id)}
                    disabled={deletingId === notif.id}
                    title="Delete notification"
                  >
                    {deletingId === notif.id ? (
                      <div className="spinner"
                        style={{ width: 14, height: 14,
                                 borderWidth: 2 }}
                      />
                    ) : (
                      <Trash2 size={15}
                        color="var(--danger)" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
  page: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '1.5rem',
    maxWidth:      '800px',
  },
  pageHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  pageTitle: {
    fontSize:     '1.25rem',
    fontWeight:   '700',
    color:        'var(--gray-900)',
    marginBottom: '0.25rem',
  },
  pageSub: {
    fontSize: '0.875rem',
    color:    'var(--gray-500)',
  },
  tabs: {
    display:      'flex',
    gap:          '0.25rem',
    background:   'var(--gray-100)',
    borderRadius: '0.625rem',
    padding:      '0.25rem',
    width:        'fit-content',
  },
  tab: {
    display:      'flex',
    alignItems:   'center',
    gap:          '0.5rem',
    padding:      '0.5rem 1rem',
    borderRadius: '0.375rem',
    border:       'none',
    background:   'transparent',
    fontSize:     '0.875rem',
    fontWeight:   '500',
    color:        'var(--gray-500)',
    cursor:       'pointer',
    transition:   'all 0.15s',
  },
  tabActive: {
    background: 'white',
    color:      'var(--gray-800)',
    boxShadow:  '0 1px 3px rgba(0,0,0,0.1)',
  },
  tabBadge: {
    background:    '#EF4444',
    color:         'white',
    fontSize:      '0.7rem',
    fontWeight:    '700',
    borderRadius:  '9999px',
    padding:       '1px 6px',
    minWidth:      '18px',
    textAlign:     'center',
  },
  notifItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        '1rem',
    padding:    '1rem 1.25rem',
    position:   'relative',
    transition: 'background 0.15s',
  },
  unreadDot: {
    position:     'absolute',
    left:         '0.5rem',
    top:          '50%',
    transform:    'translateY(-50%)',
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   '#4F46E5',
    flexShrink:   0,
  },
  notifContent: {
    flex:    1,
    minWidth:0,
  },
  notifMessage: {
    fontSize:     '0.875rem',
    color:        'var(--gray-800)',
    marginBottom: '0.25rem',
    lineHeight:   1.4,
  },
  notifTime: {
    fontSize: '0.75rem',
    color:    'var(--gray-400)',
  },
  notifActions: {
    display:    'flex',
    gap:        '0.25rem',
    flexShrink: 0,
  },
  actionBtn: {
    background:   'transparent',
    border:       'none',
    cursor:       'pointer',
    padding:      '0.375rem',
    borderRadius: '0.375rem',
    display:      'flex',
    alignItems:   'center',
    transition:   'background 0.15s',
  },
  emptyIconWrap: {
    width:          '64px',
    height:         '64px',
    background:     'var(--gray-100)',
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   '0.5rem',
  },
};

export default NotificationsPage;