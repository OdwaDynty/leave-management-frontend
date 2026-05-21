// ─── AUDIT TRAIL PAGE ─────────────────────────────────
// HR admins use this page to view the full audit trail
// of all sensitive actions taken in the system
//
// Features:
//   - View all audit log entries with filters
//   - Filter by action type, date range, or employee
//   - Colour coded badges per action type
//   - Shows who performed each action and who was affected

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format }              from 'date-fns';
import { Shield, Filter,
         RefreshCw, User }     from 'lucide-react';

import useWindowSize from '../../hooks/useWindowSize';

import { getAuditLog, getActionTypes } from '../../api/audit';

// ─── ACTION TYPE BADGE ────────────────────────────────
// Returns a coloured badge for each action type
// Makes it easy to scan the log visually
const ActionBadge = ({ type }) => {
  // Map each action type to a colour scheme
  const config = {
    // Role changes — purple
    ROLE_CHANGED:          { bg: '#EDE9FE', color: '#5B21B6' },
    ROLE_REQUEST_APPROVED: { bg: '#EDE9FE', color: '#5B21B6' },
    ROLE_REQUEST_REJECTED: { bg: '#FEE2E2', color: '#991B1B' },
    ROLE_REQUEST_SUBMITTED:{ bg: '#EDE9FE', color: '#5B21B6' },

    // Employee actions — blue
    EMPLOYEE_UPDATED:      { bg: '#DBEAFE', color: '#1E40AF' },
    EMPLOYEE_DEACTIVATED:  { bg: '#FEE2E2', color: '#991B1B' },
    EMPLOYEE_REACTIVATED:  { bg: '#D1FAE5', color: '#065F46' },

    // Leave actions — green/amber
    LEAVE_APPROVED:        { bg: '#D1FAE5', color: '#065F46' },
    LEAVE_REJECTED:        { bg: '#FEE2E2', color: '#991B1B' },
    LEAVE_CANCELLED:       { bg: '#F3F4F6', color: '#374151' },
    LEAVE_HR_APPROVED:     { bg: '#D1FAE5', color: '#065F46' },
    LEAVE_HR_REJECTED:     { bg: '#FEE2E2', color: '#991B1B' },

    // Balance actions — amber
    BALANCE_ADJUSTED:      { bg: '#FEF3C7', color: '#92400E' },
    BALANCE_ASSIGNED:      { bg: '#FEF3C7', color: '#92400E' },

    // Policy actions — indigo
    POLICY_CREATED:        { bg: '#EEF2FF', color: '#3730A3' },
    POLICY_UPDATED:        { bg: '#EEF2FF', color: '#3730A3' },
  }[type] || { bg: '#F3F4F6', color: '#374151' };

  // Format the type for display
  // e.g. ROLE_CHANGED → Role Changed
  const label = type
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

  return (
    <span style={{
      display:       'inline-block',
      padding:       '2px 10px',
      borderRadius:  '9999px',
      fontSize:      '0.75rem',
      fontWeight:    '600',
      background:    config.bg,
      color:         config.color,
      whiteSpace:    'nowrap',
    }}>
      {label}
    </span>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────
const AuditPage = () => {
  const { isMobile } = useWindowSize();
  // ── State ──────────────────────────────────────────
  const [logs,        setLogs]        = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);

  // Filter state — all optional
  const [filterAction, setFilterAction] = useState('');
  const [filterFrom,   setFilterFrom]   = useState('');
  const [filterTo,     setFilterTo]     = useState('');
  const [filterLimit,  setFilterLimit]  = useState(100);

  // ── Fetch Audit Logs ───────────────────────────────
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Build params object with only non-empty filters
      const params = {};
      if (filterAction) params.action_type = filterAction;
      if (filterFrom)   params.from        = filterFrom;
      if (filterTo)     params.to          = filterTo;
      if (filterLimit)  params.limit       = filterLimit;

      const res = await getAuditLog(params);
      setLogs(res.data.audit_logs || []);
    } catch {
      toast.error('Failed to load audit trail.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fetch Action Types for Filter Dropdown ─────────
  const fetchActionTypes = async () => {
    try {
      const res = await getActionTypes();
      setActionTypes(res.data.action_types || []);
    } catch {
      // Silently fail — filter just won't have options
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterFrom, filterTo, filterLimit]);

  useEffect(() => {
    fetchActionTypes();
  }, []);

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.titleRow}>
          {/* Shield icon to reinforce security context */}
          <div style={styles.titleIcon}>
            <Shield size={22} color="#4F46E5" />
          </div>
          <div>
            <h2 style={styles.pageTitle}>Audit Trail</h2>
            <p style={styles.pageSub}>
              Complete record of all sensitive actions
              in your company
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          className="btn btn-secondary"
          onClick={fetchLogs}
          disabled={isLoading}
        >
          <RefreshCw
            size={15}
            style={{
              // Spin the icon while loading
              animation: isLoading
                ? 'spin 0.7s linear infinite'
                : 'none',
            }}
          />
          Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="card" style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <Filter size={15} color="var(--gray-500)" />
          <span style={styles.filterTitle}>Filters</span>
          {/* Show count of results */}
          <span style={styles.resultCount}>
            {logs.length} record{logs.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{
                      display: 'flex',
                      alignItems:  isMobile ? 'stretch' : 'flex-end',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap:  '1rem',
                      flexWrap:      'wrap',}}>
                        
          {/* Action Type filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Action Type</label>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="form-select"
              style={{ width: '200px' }}
            >
              <option value="">All actions</option>
              {actionTypes.map(at => (
                <option key={at.action_type}
                  value={at.action_type}>
                  {/* Format for display */}
                  {at.action_type
                    .split('_')
                    .map(w =>
                      w.charAt(0) + w.slice(1).toLowerCase()
                    )
                    .join(' ')
                  } ({at.occurrences})
                </option>
              ))}
            </select>
          </div>

          {/* Date from filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={filterFrom}
              onChange={e => setFilterFrom(e.target.value)}
              className="form-input"
              style={{ width: '160px' }}
            />
          </div>

          {/* Date to filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={filterTo}
              onChange={e => setFilterTo(e.target.value)}
              className="form-input"
              style={{ width: '160px' }}
            />
          </div>

          {/* Limit filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Show</label>
            <select
              value={filterLimit}
              onChange={e =>
                setFilterLimit(parseInt(e.target.value))
              }
              className="form-select"
              style={{ width: '120px' }}
            >
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={250}>250 records</option>
              <option value={500}>500 records</option>
            </select>
          </div>

          {/* Clear filters button */}
          {(filterAction || filterFrom || filterTo) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilterAction('');
                setFilterFrom('');
                setFilterTo('');
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Audit Log Table ── */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <Shield size={40} />
            <p style={{ fontWeight: 600 }}>
              No audit records found
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              {filterAction || filterFrom || filterTo
                ? 'Try clearing your filters'
                : 'Actions will appear here as they happen'
              }
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Affected User</th>
                  <th>Details</th>
                  <th>Before</th>
                  <th>After</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    {/* Timestamp */}
                    <td style={styles.timeCell}>
                      <span style={styles.dateText}>
                        {format(
                          new Date(log.created_at),
                          'dd MMM yyyy'
                        )}
                      </span>
                      <span style={styles.timeText}>
                        {format(
                          new Date(log.created_at),
                          'HH:mm'
                        )}
                      </span>
                    </td>

                    {/* Action type badge */}
                    <td>
                      <ActionBadge type={log.action_type} />
                    </td>

                    {/* Who performed the action */}
                    <td>
                      <div style={styles.userCell}>
                        <User size={13}
                          color="var(--gray-400)" />
                        <span style={styles.userName}>
                          {log.performed_by_name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Who was affected */}
                    <td style={{ color: 'var(--gray-600)' }}>
                      {log.target_user_name || '—'}
                    </td>

                    {/* Human readable description */}
                    <td style={styles.descCell}>
                      {log.description || '—'}
                    </td>

                    {/* Value before change */}
                    <td>
                      {log.old_value ? (
                        <span style={styles.oldValue}>
                          {log.old_value}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Value after change */}
                    <td>
                      {log.new_value ? (
                        <span style={styles.newValue}>
                          {log.new_value}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  },
  pageHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  titleRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.875rem',
  },
  titleIcon: {
    width:          '48px',
    height:         '48px',
    background:     '#EEF2FF',
    borderRadius:   '0.75rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
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
  filterCard: {
    padding: '1.25rem 1.5rem',
  },
  filterHeader: {
    display:      'flex',
    alignItems:   'center',
    gap:          '0.5rem',
    marginBottom: '1rem',
  },
  filterTitle: {
    fontSize:   '0.875rem',
    fontWeight: '600',
    color:      'var(--gray-700)',
    flex:       1,
  },
  resultCount: {
    fontSize: '0.8125rem',
    color:    'var(--gray-400)',
  },
  filterRow: {
    display:    'flex',
    alignItems: 'flex-end',
    gap:        '1rem',
    flexWrap:   'wrap',
  },
  timeCell: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.125rem',
  },
  dateText: {
    fontSize:   '0.8125rem',
    fontWeight: '600',
    color:      'var(--gray-700)',
  },
  timeText: {
    fontSize: '0.75rem',
    color:    'var(--gray-400)',
  },
  userCell: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.375rem',
  },
  userName: {
    fontSize:   '0.8125rem',
    fontWeight: '500',
    color:      'var(--gray-700)',
  },
  descCell: {
    fontSize:  '0.8125rem',
    color:     'var(--gray-600)',
    maxWidth:  '250px',
    overflow:  'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  oldValue: {
    background:   '#FEE2E2',
    color:        '#991B1B',
    padding:      '2px 8px',
    borderRadius: '4px',
    fontSize:     '0.75rem',
    fontWeight:   '600',
  },
  newValue: {
    background:   '#D1FAE5',
    color:        '#065F46',
    padding:      '2px 8px',
    borderRadius: '4px',
    fontSize:     '0.75rem',
    fontWeight:   '600',
  },
};

export default AuditPage;