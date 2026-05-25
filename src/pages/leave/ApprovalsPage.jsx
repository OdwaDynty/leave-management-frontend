// ─── PENDING APPROVALS PAGE ───────────────────────────
// Managers and HR admins use this page to:
// 1. View all pending leave requests from their team
// 2. Approve a request with one click
// 3. Reject a request with a mandatory reason

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format }              from 'date-fns';
import {
  CheckCircle, XCircle, Clock,
  User, Calendar, AlertCircle,
} from 'lucide-react';


import {
  getPendingApprovals,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../../api/leaveRequests';

// ─── REJECT MODAL ─────────────────────────────────────
// Modal dialog for entering a rejection reason
// A reason is mandatory before rejecting
const RejectModal = ({ request, onConfirm, onClose }) => {
  const [reason,     setReason]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    setSubmitting(true);
    await onConfirm(request.id, reason);
    setSubmitting(false);
  };

  return (
    // Modal backdrop
    <div style={styles.modalBackdrop}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.modalIconWrap}>
            <XCircle size={24} color="#EF4444" />
          </div>
          <div>
            <h3 style={styles.modalTitle}>Reject Leave Request</h3>
            <p style={styles.modalSub}>
              {request.employee_name} —{' '}
              {request.leave_type_name} —{' '}
              {parseFloat(request.days_requested)} day
              {request.days_requested > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rejection Reason Input */}
        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label className="form-label">
            Rejection Reason{' '}
            <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Peak period — insufficient coverage. Please resubmit for a later date."
            className="form-input"
            rows={3}
            style={{ resize: 'vertical', minHeight: '80px' }}
            autoFocus
          />
          <span style={styles.charCount}>
            {reason.length} characters
          </span>
        </div>

        {/* Modal Actions */}
        <div style={styles.modalActions}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={submitting || !reason.trim()}
          >
            {submitting ? (
              <>
                <div className="spinner"
                  style={{ width: 14, height: 14, borderWidth: 2 }}
                />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle size={14} />
                Confirm Rejection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── REQUEST CARD ─────────────────────────────────────
// Displays a single pending leave request
// with employee info and approve/reject buttons
const RequestCard = ({ request, onApprove, onReject,
                       approvingId }) => {
  return (
    <div style={styles.card}>
      {/* ── Card Header: Employee Info ── */}
      <div style={styles.cardHeader}>
        <div style={styles.employeeInfo}>
          {/* Avatar circle with initials */}
          <div style={styles.avatar}>
            {request.employee_name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)}
          </div>
          <div>
            <p style={styles.employeeName}>
              {request.employee_name}
            </p>
            <p style={styles.employeeMeta}>
              {request.department || 'No department'} ·{' '}
              {request.employee_email}
            </p>
          </div>
        </div>

        {/* Days Requested Badge */}
        <div style={styles.daysBadge}>
          <span style={styles.daysNumber}>
            {parseFloat(request.days_requested)}
          </span>
          <span style={styles.daysLabel}>
            day{request.days_requested > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Request Details ── */}
      <div style={styles.details}>
        {/* Leave Type */}
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Leave Type</span>
          <span style={styles.detailValue}>
            {request.leave_type_name}
            {request.is_half_day && (
              <span style={styles.halfDayTag}>Half day</span>
            )}
          </span>
        </div>

        {/* Date Range */}
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Dates</span>
          <span style={styles.detailValue}>
            <Calendar
              size={13}
              style={{ marginRight: '0.25rem',
                       verticalAlign: 'middle' }}
            />
            {format(new Date(request.start_date), 'dd MMM yyyy')}
            {' → '}
            {format(new Date(request.end_date),   'dd MMM yyyy')}
          </span>
        </div>

        {/* Submitted On */}
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Submitted</span>
          <span style={styles.detailValue}>
            {format(
              new Date(request.created_at),
              'dd MMM yyyy, HH:mm'
            )}
          </span>
        </div>

        {/* Reason if provided */}
        {request.reason && (
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Reason</span>
            <span style={styles.detailValue}>
              {request.reason}
            </span>
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div style={styles.cardActions}>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onReject(request)}
          disabled={approvingId === request.id}
          style={{ flex: 1 }}
        >
          <XCircle size={14} />
          Reject
        </button>
        <button
          className="btn btn-success btn-sm"
          onClick={() => onApprove(request.id)}
          disabled={approvingId === request.id}
          style={{ flex: 1 }}
        >
          {approvingId === request.id ? (
            <>
              <div className="spinner"
                style={{ width: 14, height: 14,
                         borderWidth: 2 }}
              />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              Approve
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────
const ApprovalsPage = () => {
  
  const [requests,     setRequests]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [approvingId,  setApprovingId]  = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  // ── Fetch Pending Approvals ────────────────────────
  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await getPendingApprovals();
      setRequests(res.data.leave_requests || []);
    } catch {
      toast.error('Failed to load pending approvals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApprovals(); }, []);

  // ── Approve Handler ────────────────────────────────
  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await approveLeaveRequest(id);
      toast.success('Leave request approved!');
      // Remove from the list immediately
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to approve request.';
      toast.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  // ── Reject Handler ─────────────────────────────────
  const handleReject = async (id, reason) => {
    try {
      await rejectLeaveRequest(id, { rejection_reason: reason });
      toast.success('Leave request rejected.');
      // Remove from the list immediately
      setRequests(prev => prev.filter(r => r.id !== id));
      setRejectTarget(null);
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to reject request.';
      toast.error(msg);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Pending Approvals</h2>
          <p style={styles.pageSub}>
            Review and action your team's leave requests
          </p>
        </div>

        {/* Pending count badge */}
        {requests.length > 0 && (
          <div style={styles.countBadge}>
            <Clock size={16} color="#92400E" />
            <span>
              {requests.length} pending request
              {requests.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>

      ) : requests.length === 0 ? (
        // Empty state — all caught up
        <div className="card">
          <div className="empty-state">
            <div style={styles.emptyIcon}>
              <CheckCircle size={40} color="#10B981" />
            </div>
            <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>
              All caught up!
            </p>
            <p style={{ color: 'var(--gray-400)',
                        fontSize: '0.875rem' }}>
              There are no pending leave requests to review.
            </p>
          </div>
        </div>

      ) : (
        // Requests grid
        <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '1.25rem',}}>

          {requests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onReject={req => setRejectTarget(req)}
              approvingId={approvingId}
            />
          ))}
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}

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
  countBadge: {
    display:      'flex',
    alignItems:   'center',
    gap:          '0.5rem',
    background:   '#FEF3C7',
    border:       '1px solid #FCD34D',
    borderRadius: '2rem',
    padding:      '0.5rem 1rem',
    fontSize:     '0.875rem',
    fontWeight:   '600',
    color:        '#92400E',
  },
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap:                 '1.25rem',
  },
  card: {
    background:    'white',
    borderRadius:  '0.75rem',
    border:        '1px solid var(--gray-200)',
    boxShadow:     '0 2px 8px rgba(0,0,0,0.06)',
    overflow:      'hidden',
    display:       'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '1.25rem',
    borderBottom:   '1px solid var(--gray-100)',
    background:     'var(--gray-50)',
  },
  employeeInfo: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
  },
  avatar: {
    width:          '40px',
    height:         '40px',
    borderRadius:   '50%',
    background:     '#4F46E5',
    color:          'white',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     '700',
    fontSize:       '0.875rem',
    flexShrink:     0,
  },
  employeeName: {
    fontWeight:   '600',
    fontSize:     '0.9375rem',
    color:        'var(--gray-800)',
    marginBottom: '0.125rem',
  },
  employeeMeta: {
    fontSize: '0.75rem',
    color:    'var(--gray-500)',
  },
  daysBadge: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    background:     '#EEF2FF',
    borderRadius:   '0.5rem',
    padding:        '0.375rem 0.75rem',
    minWidth:       '52px',
  },
  daysNumber: {
    fontSize:   '1.25rem',
    fontWeight: '700',
    color:      '#4F46E5',
    lineHeight: 1,
  },
  daysLabel: {
    fontSize: '0.6875rem',
    color:    '#6366F1',
    marginTop:'0.125rem',
  },
  details: {
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap:     '0.625rem',
    flex:    1,
  },
  detailItem: {
    display: 'flex',
    gap:     '0.5rem',
  },
  detailLabel: {
    fontSize:   '0.8125rem',
    color:      'var(--gray-400)',
    fontWeight: '500',
    minWidth:   '80px',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: '0.8125rem',
    color:    'var(--gray-700)',
    fontWeight:'500',
  },
  halfDayTag: {
    display:      'inline-block',
    marginLeft:   '0.375rem',
    fontSize:     '0.7rem',
    background:   '#EEF2FF',
    color:        '#4F46E5',
    padding:      '1px 6px',
    borderRadius: '9999px',
    fontWeight:   '500',
  },
  cardActions: {
    display:     'flex',
    gap:         '0.75rem',
    padding:     '1rem 1.25rem',
    borderTop:   '1px solid var(--gray-100)',
    background:  'var(--gray-50)',
  },
  emptyIcon: {
    width:          '72px',
    height:         '72px',
    background:     '#D1FAE5',
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   '0.5rem',
  },

  // ── Modal Styles ──────────────────────────────────
  modalBackdrop: {
    position:        'fixed',
    inset:           0,
    background:      'rgba(0,0,0,0.5)',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          1000,
    padding:         '1rem',
  },
  modal: {
    background:    'white',
    borderRadius:  '1rem',
    padding:       '1.75rem',
    width:         '100%',
    maxWidth:      '480px',
    boxShadow:     '0 25px 50px rgba(0,0,0,0.25)',
  },
  modalHeader: {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        '1rem',
  },
  modalIconWrap: {
    width:          '48px',
    height:         '48px',
    background:     '#FEE2E2',
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  modalTitle: {
    fontSize:     '1.125rem',
    fontWeight:   '700',
    color:        'var(--gray-900)',
    marginBottom: '0.25rem',
  },
  modalSub: {
    fontSize: '0.875rem',
    color:    'var(--gray-500)',
  },
  charCount: {
    fontSize:  '0.75rem',
    color:     'var(--gray-400)',
    marginTop: '0.25rem',
  },
  modalActions: {
    display:        'flex',
    justifyContent: 'flex-end',
    gap:            '0.75rem',
    marginTop:      '1.25rem',
  },
};

export default ApprovalsPage;