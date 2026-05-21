// ─── ROLE REQUEST PAGE (EMPLOYEE VIEW) ────────────────
// Employees use this page to:
//   1. Submit a promotion/role change request
//   2. View the history of their past requests
//   3. See the status of pending requests
//
// The page has two sections:
//   Top    → Submit new request form
//   Bottom → History of all past requests

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format }              from 'date-fns';
import { TrendingUp, Send,
         Clock, CheckCircle,
         XCircle }             from 'lucide-react';
import { submitRoleRequest,
         getMyRoleRequests }   from '../../api/roleRequests';
import { useAuth }             from '../../context/AuthContext';

// ─── STATUS BADGE ─────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    pending:  { bg: '#FEF3C7', color: '#92400E',
                icon: Clock },
    approved: { bg: '#D1FAE5', color: '#065F46',
                icon: CheckCircle },
    rejected: { bg: '#FEE2E2', color: '#991B1B',
                icon: XCircle },
  }[status] || { bg: '#F3F4F6', color: '#374151',
                  icon: Clock };

  const Icon = config.icon;

  return (
    <span style={{
      display:    'inline-flex',
      alignItems: 'center',
      gap:        '0.25rem',
      padding:    '3px 10px',
      borderRadius: '9999px',
      fontSize:   '0.75rem',
      fontWeight: '600',
      background: config.bg,
      color:      config.color,
    }}>
      <Icon size={11} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────
const RoleRequestPage = () => {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────
  const [requests,    setRequests]    = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [submitting,  setSubmitting]  = useState(false);

  // Check if there is already a pending request
  // Used to disable the form when one is pending
  const hasPending = requests.some(
    r => r.status === 'pending'
  );

  // Form state
  const [formData, setFormData] = useState({
    requested_role: '',
    reason:         '',
  });

  // ── Fetch My Requests ──────────────────────────────
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await getMyRoleRequests();
      setRequests(res.data.role_requests || []);
    } catch {
      toast.error('Failed to load role requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── Submit New Request ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.requested_role) {
      toast.error('Please select a role to request.');
      return;
    }
    if (formData.reason.trim().length < 20) {
      toast.error(
        'Please provide a detailed reason '
        + '(at least 20 characters).'
      );
      return;
    }

    setSubmitting(true);
    try {
      await submitRoleRequest(formData);
      toast.success(
        'Role request submitted! HR will review it.'
      );
      // Reset form
      setFormData({ requested_role: '', reason: '' });
      // Refresh the list
      fetchRequests();
    } catch (err) {
      toast.error(
        err.response?.data?.error
        || 'Failed to submit role request.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Available roles to request
  // Only roles higher than current role are shown
  const availableRoles = ['manager', 'hr_admin', 'super_admin']
    .filter(r => r !== user?.role);

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.titleRow}>
          <div style={styles.titleIcon}>
            <TrendingUp size={22} color="#4F46E5" />
          </div>
          <div>
            <h2 style={styles.pageTitle}>
              Role Change Request
            </h2>
            <p style={styles.pageSub}>
              Request a promotion or role change.
              HR will review your request.
            </p>
          </div>
        </div>
      </div>

      {/* ── Current Role Banner ── */}
      <div style={styles.currentRoleBanner}>
        <div>
          <p style={styles.currentRoleLabel}>
            Your Current Role
          </p>
          <p style={styles.currentRoleValue}>
            {user?.role
              ?.split('_')
              .map(w =>
                w.charAt(0).toUpperCase() + w.slice(1)
              )
              .join(' ')}
          </p>
        </div>
        {hasPending && (
          <div style={styles.pendingAlert}>
            <Clock size={15} color="#92400E" />
            <span>
              You have a pending request awaiting HR review
            </span>
          </div>
        )}
      </div>

      {/* ── Submit Form ── */}
      <div className="card">
        <h3 style={styles.formTitle}>
          Submit New Request
        </h3>

        {/* Show message if a request is already pending */}
        {hasPending ? (
          <div style={styles.blockedMsg}>
            <Clock size={16} color="#92400E" />
            <p style={styles.blockedText}>
              You already have a pending role request.
              Please wait for HR to review it before
              submitting a new one.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">
                Requested Role{' '}
                <span style={{ color: 'var(--danger)' }}>
                  *
                </span>
              </label>
              <select
                value={formData.requested_role}
                onChange={e => setFormData(p => ({
                  ...p, requested_role: e.target.value
                }))}
                className="form-select"
                required
              >
                <option value="">Select a role</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.split('_')
                      .map(w =>
                        w.charAt(0).toUpperCase()
                        + w.slice(1)
                      )
                      .join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason textarea */}
            <div className="form-group">
              <label className="form-label">
                Reason for Request{' '}
                <span style={{ color: 'var(--danger)' }}>
                  *
                </span>
              </label>
              <textarea
                value={formData.reason}
                onChange={e => setFormData(p => ({
                  ...p, reason: e.target.value
                }))}
                placeholder="Explain why you are requesting this role change. Include relevant experience, responsibilities you have taken on, and why you believe you are ready for this role. (minimum 20 characters)"
                className="form-input"
                rows={5}
                style={{ resize: 'vertical' }}
                required
              />
              {/* Character count indicator */}
              <span style={{
                fontSize:  '0.75rem',
                color: formData.reason.length < 20
                  ? 'var(--danger)'
                  : 'var(--gray-400)',
                marginTop: '0.25rem',
              }}>
                {formData.reason.length} characters
                {formData.reason.length < 20 &&
                  ` (${20 - formData.reason.length} more needed)`
                }
              </span>
            </div>

            {/* Submit button */}
            <div style={{ display: 'flex',
                          justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  submitting ||
                  formData.reason.length < 20
                }
              >
                {submitting ? (
                  <>
                    <div className="spinner"
                      style={{ width: 14, height: 14,
                               borderWidth: 2 }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Request History ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={styles.historyHeader}>
          <h3 style={styles.historyTitle}>
            My Request History
          </h3>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={36} />
            <p style={{ fontWeight: 600 }}>
              No requests yet
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Submit your first role change request above
            </p>
          </div>
        ) : (
          <div>
            {requests.map((req, i) => (
              <div key={req.id} style={{
                ...styles.historyItem,
                borderBottom: i < requests.length - 1
                  ? '1px solid var(--gray-100)' : 'none',
              }}>
                {/* Role change arrow */}
                <div style={styles.roleChange}>
                  <span style={styles.fromRole}>
                    {req.from_role}
                  </span>
                  <span style={styles.arrow}>→</span>
                  <span style={styles.toRole}>
                    {req.to_role}
                  </span>
                </div>

                {/* Status */}
                <StatusBadge status={req.status} />

                {/* Dates and reviewer */}
                <div style={styles.historyMeta}>
                  <span>
                    Submitted{' '}
                    {format(
                      new Date(req.created_at),
                      'dd MMM yyyy'
                    )}
                  </span>
                  {req.reviewed_by_name && (
                    <span>
                      Reviewed by {req.reviewed_by_name}
                    </span>
                  )}
                </div>

                {/* Show rejection reason if rejected */}
                {req.status === 'rejected' &&
                  req.rejection_reason && (
                  <div style={styles.rejectionNote}>
                    <p style={styles.rejectionLabel}>
                      Reason:
                    </p>
                    <p style={styles.rejectionText}>
                      {req.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Show approval note if approved */}
                {req.status === 'approved' &&
                  req.approval_note && (
                  <div style={styles.approvalNote}>
                    <p style={styles.approvalText}>
                      {req.approval_note}
                    </p>
                  </div>
                )}
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
    display: 'flex', flexDirection: 'column',
    gap: '1.5rem', maxWidth: '800px',
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    display: 'flex', alignItems: 'center', gap: '0.875rem',
  },
  titleIcon: {
    width: '48px', height: '48px', background: '#EEF2FF',
    borderRadius: '0.75rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: '1.25rem', fontWeight: '700',
    color: 'var(--gray-900)', marginBottom: '0.25rem',
  },
  pageSub: { fontSize: '0.875rem', color: 'var(--gray-500)' },
  currentRoleBanner: {
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    borderRadius: '0.75rem', padding: '1.25rem 1.5rem',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', color: 'white',
  },
  currentRoleLabel: {
    fontSize: '0.8125rem', opacity: 0.8, marginBottom: '0.25rem',
  },
  currentRoleValue: {
    fontSize: '1.25rem', fontWeight: '700', color: 'white',
  },
  pendingAlert: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#FEF3C7', borderRadius: '0.5rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.8125rem', fontWeight: '600',
    color: '#92400E',
  },
  formTitle: {
    fontSize: '1rem', fontWeight: '600',
    color: 'var(--gray-800)', marginBottom: '1.25rem',
  },
  blockedMsg: {
    display: 'flex', alignItems: 'flex-start',
    gap: '0.75rem', background: '#FEF3C7',
    border: '1px solid #FCD34D', borderRadius: '0.5rem',
    padding: '1rem',
  },
  blockedText: {
    fontSize: '0.875rem', color: '#92400E',
    lineHeight: 1.5,
  },
  historyHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--gray-100)',
  },
  historyTitle: {
    fontSize: '1rem', fontWeight: '600',
    color: 'var(--gray-800)',
  },
  historyItem: {
    padding: '1.25rem 1.5rem',
    display: 'flex', alignItems: 'center',
    gap: '1.25rem', flexWrap: 'wrap',
  },
  roleChange: {
    display: 'flex', alignItems: 'center',
    gap: '0.5rem', flex: 1,
  },
  fromRole: {
    fontSize: '0.875rem', fontWeight: '600',
    color: 'var(--gray-500)', textTransform: 'capitalize',
  },
  arrow: { color: 'var(--gray-400)', fontSize: '1rem' },
  toRole: {
    fontSize: '0.875rem', fontWeight: '700',
    color: '#4F46E5', textTransform: 'capitalize',
  },
  historyMeta: {
    display: 'flex', flexDirection: 'column',
    gap: '0.125rem', fontSize: '0.75rem',
    color: 'var(--gray-400)',
  },
  rejectionNote: {
    width: '100%', background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '0.5rem', padding: '0.75rem',
  },
  rejectionLabel: {
    fontSize: '0.75rem', fontWeight: '700',
    color: '#991B1B', marginBottom: '0.25rem',
  },
  rejectionText: {
    fontSize: '0.8125rem', color: '#991B1B',
  },
  approvalNote: {
    width: '100%', background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '0.5rem', padding: '0.75rem',
  },
  approvalText: {
    fontSize: '0.8125rem', color: '#065F46',
  },
};

export default RoleRequestPage;