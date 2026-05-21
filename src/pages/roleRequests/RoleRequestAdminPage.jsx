// ─── ROLE REQUEST ADMIN PAGE (HR VIEW) ────────────────
// HR admins use this page to:
//   1. View all pending role change requests
//   2. Approve requests (role updates automatically)
//   3. Reject requests with a mandatory reason
//
// This page is only accessible to hr_admin and super_admin

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format }              from 'date-fns';
import {
  CheckCircle, XCircle,
  Users, TrendingUp,
} from 'lucide-react';
import { getPendingRoleRequests,
         approveRoleRequest,
         rejectRoleRequest }   from '../../api/roleRequests';

// ─── REJECT MODAL ─────────────────────────────────────
// Modal requiring HR to enter a rejection reason
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
    <div style={styles.modalBackdrop}>
      <div style={styles.modal}>
        {/* Modal header */}
        <div style={styles.modalHeader}>
          <div style={styles.modalIconWrap}>
            <XCircle size={24} color="#EF4444" />
          </div>
          <div>
            <h3 style={styles.modalTitle}>
              Reject Role Request
            </h3>
            <p style={styles.modalSub}>
              {request.employee_name} wants to become{' '}
              <strong>{request.to_role}</strong>
            </p>
          </div>
        </div>

        {/* Rejection reason input */}
        <div style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">
              Rejection Reason{' '}
              <span style={{ color: 'var(--danger)' }}>
                *
              </span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Explain why this request is being rejected. This will be visible to the employee."
              className="form-input"
              rows={3}
              style={{ resize: 'vertical' }}
              autoFocus
            />
          </div>

          {/* Modal action buttons */}
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
                    style={{ width: 14, height: 14,
                             borderWidth: 2 }}
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
    </div>
  );
};

// ─── REQUEST CARD ─────────────────────────────────────
// Displays one pending role request as a card
const RequestCard = ({
  request,
  onApprove,
  onReject,
  approvingId,
}) => (
  <div style={styles.card}>
    {/* Card header — employee info */}
    <div style={styles.cardHeader}>
      {/* Avatar with initials */}
      <div style={styles.avatar}>
        {request.employee_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)}
      </div>
      <div style={{ flex: 1 }}>
        <p style={styles.empName}>
          {request.employee_name}
        </p>
        <p style={styles.empMeta}>
          {request.employee_email}
          {request.employee_department &&
            ` · ${request.employee_department}`}
        </p>
      </div>
      {/* Submitted date */}
      <span style={styles.submittedDate}>
        {format(
          new Date(request.created_at),
          'dd MMM yyyy'
        )}
      </span>
    </div>

    {/* Role change display */}
    <div style={styles.roleChangeRow}>
      <div style={styles.roleBox}>
        <span style={styles.roleBoxLabel}>Current Role</span>
        <span style={styles.fromRoleText}>
          {request.from_role
            ?.split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')}
        </span>
      </div>

      {/* Arrow */}
      <div style={styles.arrowWrap}>
        <TrendingUp size={20} color="#4F46E5" />
      </div>

      <div style={{
        ...styles.roleBox,
        background: '#EEF2FF',
        border: '1px solid #C7D2FE',
      }}>
        <span style={styles.roleBoxLabel}>
          Requested Role
        </span>
        <span style={{
          ...styles.fromRoleText,
          color: '#4F46E5',
        }}>
          {request.to_role
            ?.split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')}
        </span>
      </div>
    </div>

    {/* Employee's reason */}
    <div style={styles.reasonBox}>
      <p style={styles.reasonLabel}>
        Reason from employee:
      </p>
      <p style={styles.reasonText}>{request.reason}</p>
    </div>

    {/* Action buttons */}
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
            Approve Promotion
          </>
        )}
      </button>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────
const RoleRequestAdminPage = () => {
  const [requests,     setRequests]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [approvingId,  setApprovingId]  = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  // ── Fetch Pending Requests ─────────────────────────
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await getPendingRoleRequests();
      setRequests(res.data.role_requests || []);
    } catch {
      toast.error('Failed to load role requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── Approve Handler ────────────────────────────────
  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await approveRoleRequest(id, {});
      toast.success(res.data.message);
      // Remove from list immediately after approval
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error(
        err.response?.data?.error
        || 'Failed to approve request.'
      );
    } finally {
      setApprovingId(null);
    }
  };

  // ── Reject Handler ─────────────────────────────────
  const handleReject = async (id, reason) => {
    try {
      await rejectRoleRequest(id, {
        rejection_reason: reason
      });
      toast.success('Role request rejected.');
      // Remove from list after rejection
      setRequests(prev => prev.filter(r => r.id !== id));
      setRejectTarget(null);
    } catch (err) {
      toast.error(
        err.response?.data?.error
        || 'Failed to reject request.'
      );
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>
            Pending Role Requests
          </h2>
          <p style={styles.pageSub}>
            Review and action employee promotion requests
          </p>
        </div>
        {/* Pending count badge */}
        {requests.length > 0 && (
          <div style={styles.countBadge}>
            <Users size={15} color="#92400E" />
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
        <div className="card">
          <div className="empty-state">
            <div style={styles.emptyIcon}>
              <CheckCircle size={36} color="#10B981" />
            </div>
            <p style={{ fontWeight: 600,
                        fontSize: '1.125rem' }}>
              All caught up!
            </p>
            <p style={{ color: 'var(--gray-400)',
                        fontSize: '0.875rem' }}>
              There are no pending role requests to review.
            </p>
          </div>
        </div>
      ) : (
        // Grid of request cards
        <div style={styles.grid}>
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
    display: 'flex', flexDirection: 'column', gap: '1.5rem',
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontSize: '1.25rem', fontWeight: '700',
    color: 'var(--gray-900)', marginBottom: '0.25rem',
  },
  pageSub: { fontSize: '0.875rem', color: 'var(--gray-500)' },
  countBadge: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#FEF3C7', border: '1px solid #FCD34D',
    borderRadius: '2rem', padding: '0.5rem 1rem',
    fontSize: '0.875rem', fontWeight: '600',
    color: '#92400E',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: 'white', borderRadius: '0.75rem',
    border: '1px solid var(--gray-200)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden', display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center',
    gap: '0.75rem', padding: '1.25rem',
    background: 'var(--gray-50)',
    borderBottom: '1px solid var(--gray-100)',
  },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: '#4F46E5', color: 'white',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: '700',
    fontSize: '0.875rem', flexShrink: 0,
  },
  empName: {
    fontWeight: '600', fontSize: '0.9375rem',
    color: 'var(--gray-800)', marginBottom: '0.125rem',
  },
  empMeta: { fontSize: '0.75rem', color: 'var(--gray-500)' },
  submittedDate: {
    fontSize: '0.75rem', color: 'var(--gray-400)',
    whiteSpace: 'nowrap',
  },
  roleChangeRow: {
    display: 'flex', alignItems: 'center',
    gap: '0.75rem', padding: '1.25rem',
    borderBottom: '1px solid var(--gray-100)',
  },
  roleBox: {
    flex: 1, background: 'var(--gray-50)',
    border: '1px solid var(--gray-200)',
    borderRadius: '0.5rem', padding: '0.75rem',
    display: 'flex', flexDirection: 'column',
    gap: '0.25rem',
  },
  roleBoxLabel: {
    fontSize: '0.7rem', fontWeight: '600',
    color: 'var(--gray-400)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  fromRoleText: {
    fontSize: '0.9375rem', fontWeight: '700',
    color: 'var(--gray-700)', textTransform: 'capitalize',
  },
  arrowWrap: {
    width: '36px', height: '36px', background: '#EEF2FF',
    borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  reasonBox: {
    padding: '1rem 1.25rem', flex: 1,
    borderBottom: '1px solid var(--gray-100)',
  },
  reasonLabel: {
    fontSize: '0.75rem', fontWeight: '600',
    color: 'var(--gray-400)', marginBottom: '0.375rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  reasonText: {
    fontSize: '0.875rem', color: 'var(--gray-700)',
    lineHeight: 1.6,
  },
  cardActions: {
    display: 'flex', gap: '0.75rem',
    padding: '1rem 1.25rem',
    background: 'var(--gray-50)',
  },
  emptyIcon: {
    width: '72px', height: '72px', background: '#D1FAE5',
    borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  modalBackdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: 'white', borderRadius: '1rem',
    width: '100%', maxWidth: '460px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center',
    gap: '1rem', padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--gray-200)',
  },
  modalIconWrap: {
    width: '48px', height: '48px', background: '#FEE2E2',
    borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: '1.125rem', fontWeight: '700',
    color: 'var(--gray-900)', marginBottom: '0.25rem',
  },
  modalSub: { fontSize: '0.875rem', color: 'var(--gray-500)' },
  modalActions: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '0.75rem', marginTop: '1.25rem',
  },
};

export default RoleRequestAdminPage;