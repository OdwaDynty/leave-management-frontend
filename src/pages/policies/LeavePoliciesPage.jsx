// ─── LEAVE POLICIES PAGE ──────────────────────────────
// HR admins use this page to:
//   1. View all role-based leave entitlement policies
//   2. Create new policies (e.g. managers get 20 days)
//   3. Update entitled days for existing policies
//   4. Auto-assign balances to all staff for a new year
//
// A policy says: for THIS leave type, employees with
// THIS role get THIS many days per year automatically

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format }              from 'date-fns';
import {
  Plus, Edit, Save, X,
  Play, Settings,
} from 'lucide-react';

import useWindowSize from '../../hooks/useWindowSize';

import { listPolicies,
         createPolicy,
         updatePolicy,
         autoAssignBalances } from '../../api/leavePolicies';
import { listLeaveTypes }     from '../../api/leaveTypes';

// ─── ROLE BADGE ───────────────────────────────────────
// Coloured badge showing which role a policy applies to
const RoleBadge = ({ role }) => {
  // Each role gets its own colour for quick scanning
  const config = {
    all:         { bg: '#F3F4F6', color: '#374151' },
    employee:    { bg: '#DBEAFE', color: '#1E40AF' },
    manager:     { bg: '#D1FAE5', color: '#065F46' },
    hr_admin:    { bg: '#EDE9FE', color: '#5B21B6' },
    super_admin: { bg: '#FEF3C7', color: '#92400E' },
  }[role] || { bg: '#F3F4F6', color: '#374151' };

  // Capitalise and format role name for display
  const label = role === 'all'
    ? 'All Roles'
    : role.split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

  return (
    <span style={{
      display:      'inline-block',
      padding:      '3px 10px',
      borderRadius: '9999px',
      fontSize:     '0.75rem',
      fontWeight:   '600',
      background:   config.bg,
      color:        config.color,
    }}>
      {label}
    </span>
  );
};

// ─── POLICY MODAL ─────────────────────────────────────
// Modal for creating a new policy or editing existing
const PolicyModal = ({
  policy,      // null = create mode, object = edit mode
  leaveTypes,  // List of available leave types
  onSave,      // Callback after save
  onClose,     // Callback to close modal
}) => {
  const isEditing = !!policy;

  // Form state — pre-fill if editing
  const [formData, setFormData] = useState({
    leave_type_id:   policy?.leave_type_id   || '',
    applies_to_role: policy?.applies_to_role || 'all',
    entitled_days:   policy?.entitled_days   || 0,
  });
  const [saving, setSaving] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leave_type_id) {
      toast.error('Please select a leave type.');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modal}>
        {/* Modal header */}
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            {isEditing
              ? 'Edit Leave Policy'
              : 'Create Leave Policy'}
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>

            {/* Leave type selector */}
            <div className="form-group">
              <label className="form-label">
                Leave Type{' '}
                <span style={{ color: 'var(--danger)' }}>
                  *
                </span>
              </label>
              <select
                value={formData.leave_type_id}
                onChange={e => setFormData(p => ({
                  ...p, leave_type_id: e.target.value
                }))}
                className="form-select"
                // Cannot change leave type when editing
                disabled={isEditing}
                required
              >
                <option value="">Select leave type</option>
                {leaveTypes.map(lt => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">
                Applies To Role
              </label>
              <select
                value={formData.applies_to_role}
                onChange={e => setFormData(p => ({
                  ...p, applies_to_role: e.target.value
                }))}
                className="form-select"
                // Cannot change role when editing
                disabled={isEditing}
              >
                <option value="all">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr_admin">HR Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <span style={styles.hint}>
                Use "All Roles" to give everyone the same
                entitlement regardless of role
              </span>
            </div>

            {/* Entitled days */}
            <div className="form-group">
              <label className="form-label">
                Entitled Days Per Year
              </label>
              <input
                type="number"
                value={formData.entitled_days}
                onChange={e => setFormData(p => ({
                  ...p,
                  entitled_days: parseInt(e.target.value)
                }))}
                className="form-input"
                min={0}
                max={365}
                required
              />
            </div>
          </div>

          {/* Modal footer */}
          <div style={styles.modalFooter}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner"
                    style={{ width: 14, height: 14,
                             borderWidth: 2 }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  {isEditing
                    ? 'Save Changes'
                    : 'Create Policy'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────
const LeavePoliciesPage = () => {
  
  // ── State ──────────────────────────────────────────
  const [policies,    setPolicies]    = useState([]);
  const [leaveTypes,  setLeaveTypes]  = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);

  // Auto-assign state
  const [assignYear,    setAssignYear]    = useState(
    new Date().getFullYear()
  );
  const [assigning,     setAssigning]     = useState(false);
  const [assignResult,  setAssignResult]  = useState(null);

  // ── Fetch Data ─────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [polRes, ltRes] = await Promise.all([
        listPolicies(),
        listLeaveTypes({ is_active: true }),
      ]);
      setPolicies(polRes.data.policies     || []);
      setLeaveTypes(ltRes.data.leave_types || []);
    } catch {
      toast.error('Failed to load leave policies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Create Policy ──────────────────────────────────
  const handleCreate = async (data) => {
    try {
      await createPolicy(data);
      toast.success('Policy created successfully!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.error
        || 'Failed to create policy.'
      );
    }
  };

  // ── Update Policy ──────────────────────────────────
  const handleEdit = async (data) => {
    try {
      await updatePolicy(editTarget.id, {
        entitled_days: data.entitled_days
      });
      toast.success('Policy updated successfully!');
      setEditTarget(null);
      fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.error
        || 'Failed to update policy.'
      );
    }
  };

  // ── Auto-Assign Balances ───────────────────────────
  const handleAutoAssign = async () => {
    if (!window.confirm(
      `Auto-assign leave balances for ${assignYear} `
      + `based on current policies? `
      + `Existing balances will be skipped.`
    )) return;

    setAssigning(true);
    setAssignResult(null);
    try {
      const res = await autoAssignBalances({
        year: assignYear
      });
      setAssignResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(
        err.response?.data?.error
        || 'Failed to auto-assign balances.'
      );
    } finally {
      setAssigning(false);
    }
  };

  // Group policies by leave type for display
  const grouped = policies.reduce((acc, p) => {
    const key = p.leave_type_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Leave Policies</h2>
          <p style={styles.pageSub}>
            Configure how many days each role gets
            per leave type per year
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Create Policy
        </button>
      </div>

      {/* ── Auto-Assign Banner ── */}
      <div style={{
                    ...styles.assignBanner,
                    flexDirection: 'row',
                    flexWrap:      'wrap',}}>
        <div style={styles.assignLeft}>
          <div style={styles.assignIcon}>
            <Play size={18} color="#4F46E5" />
          </div>
          <div>
            <p style={styles.assignTitle}>
              Auto-Assign Balances
            </p>
            <p style={styles.assignSub}>
              Automatically create leave balances for all
              active employees based on their role policies.
              Existing balances are skipped.
            </p>
          </div>
        </div>

        {/* Year selector and run button */}
        <div style={styles.assignRight}>
          <select
            value={assignYear}
            onChange={e =>
              setAssignYear(parseInt(e.target.value))
            }
            className="form-select"
            style={{ width: '120px' }}
          >
            {[2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={handleAutoAssign}
            disabled={assigning || policies.length === 0}
          >
            {assigning ? (
              <>
                <div className="spinner"
                  style={{ width: 14, height: 14,
                           borderWidth: 2 }}
                />
                Assigning...
              </>
            ) : (
              <>
                <Play size={14} />
                Run Auto-Assign
              </>
            )}
          </button>
        </div>
      </div>

      {/* Show result after auto-assign */}
      {assignResult && (
        <div style={styles.assignResult}>
          <p style={styles.assignResultText}>
            <strong>Auto-assign complete for {assignResult.year}:</strong>
            {' '}{assignResult.assigned} balance
            {assignResult.assigned !== 1 ? 's' : ''} created,
            {' '}{assignResult.skipped} skipped
            (already existed).
          </p>
          <button
            style={styles.dismissBtn}
            onClick={() => setAssignResult(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Policies Grid ── */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : policies.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Settings size={40} />
            <p style={{ fontWeight: 600 }}>
              No leave policies yet
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Create policies to define how many days
              each role gets per leave type
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowModal(true)}
              style={{ marginTop: '0.5rem' }}
            >
              <Plus size={14} />
              Create First Policy
            </button>
          </div>
        </div>
      ) : (
        // Group by leave type for easy reading
        Object.entries(grouped).map(([ltName, ltPolicies]) => (
          <div key={ltName} className="card"
            style={{ padding: 0 }}>

            {/* Leave type header */}
            <div style={styles.groupHeader}>
              <h3 style={styles.groupTitle}>{ltName}</h3>
              <span style={styles.groupCount}>
                {ltPolicies.length} rule
                {ltPolicies.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Policy rows */}
            {ltPolicies.map((policy, i) => (
              <div key={policy.id} style={{
                ...styles.policyRow,
                borderBottom: i < ltPolicies.length - 1
                  ? '1px solid var(--gray-100)' : 'none',
              }}>
                {/* Role badge */}
                <RoleBadge role={policy.applies_to_role} />

                {/* Days entitlement */}
                <div style={styles.daysDisplay}>
                  <span style={styles.daysNumber}>
                    {policy.entitled_days}
                  </span>
                  <span style={styles.daysLabel}>
                    days / year
                  </span>
                </div>

                {/* Last updated */}
                <span style={styles.updatedText}>
                  Updated{' '}
                  {format(
                    new Date(policy.updated_at),
                    'dd MMM yyyy'
                  )}
                </span>

                {/* Edit button */}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditTarget(policy)}
                  title="Edit entitled days"
                >
                  <Edit size={13} />
                  Edit Days
                </button>
              </div>
            ))}
          </div>
        ))
      )}

      {/* ── Create Modal ── */}
      {showModal && (
        <PolicyModal
          policy={null}
          leaveTypes={leaveTypes}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <PolicyModal
          policy={editTarget}
          leaveTypes={leaveTypes}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
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
  assignBanner: {
    background: '#EEF2FF',
    border: '1px solid #C7D2FE',
    borderRadius: '0.75rem',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  assignLeft: {
    display: 'flex', alignItems: 'flex-start',
    gap: '0.875rem', flex: 1,
  },
  assignIcon: {
    width: '40px', height: '40px',
    background: 'white', borderRadius: '0.5rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  assignTitle: {
    fontSize: '0.9375rem', fontWeight: '700',
    color: '#3730A3', marginBottom: '0.25rem',
  },
  assignSub: {
    fontSize: '0.8125rem', color: '#4F46E5', lineHeight: 1.5,
  },
  assignRight: {
    display: 'flex', alignItems: 'center',
    gap: '0.75rem', flexShrink: 0,
  },
  assignResult: {
    background: '#D1FAE5', border: '1px solid #A7F3D0',
    borderRadius: '0.5rem', padding: '0.875rem 1.25rem',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignResultText: {
    fontSize: '0.875rem', color: '#065F46',
  },
  dismissBtn: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', color: '#065F46',
    display: 'flex', alignItems: 'center',
  },
  groupHeader: {
    display: 'flex', alignItems: 'center',
    gap: '0.75rem', padding: '1rem 1.5rem',
    background: 'var(--gray-50)',
    borderBottom: '1px solid var(--gray-100)',
  },
  groupTitle: {
    fontSize: '0.9375rem', fontWeight: '700',
    color: 'var(--gray-800)', flex: 1,
  },
  groupCount: {
    fontSize: '0.75rem', color: 'var(--gray-400)',
  },
  policyRow: {
    display: 'flex', alignItems: 'center',
    gap: '1.5rem', padding: '1rem 1.5rem',
  },
  daysDisplay: {
    display: 'flex', alignItems: 'baseline',
    gap: '0.375rem', flex: 1,
  },
  daysNumber: {
    fontSize: '1.75rem', fontWeight: '800',
    color: '#4F46E5', lineHeight: 1,
  },
  daysLabel: {
    fontSize: '0.8125rem', color: 'var(--gray-400)',
  },
  updatedText: {
    fontSize: '0.75rem', color: 'var(--gray-400)',
    whiteSpace: 'nowrap',
  },
  hint: {
    fontSize: '0.75rem', color: 'var(--gray-400)',
    marginTop: '0.25rem',
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
    width: '100%', maxWidth: '480px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    maxHeight: '90vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--gray-200)',
  },
  modalTitle: {
    fontSize: '1.125rem', fontWeight: '700',
    color: 'var(--gray-900)',
  },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--gray-400)', cursor: 'pointer',
    padding: '0.25rem', borderRadius: '0.375rem',
    display: 'flex',
  },
  modalBody: { padding: '1.5rem', overflowY: 'auto' },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '0.75rem', padding: '1rem 1.5rem',
    borderTop: '1px solid var(--gray-200)',
    background: 'var(--gray-50)',
  },
};

export default LeavePoliciesPage;