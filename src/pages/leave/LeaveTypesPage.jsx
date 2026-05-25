// ─── LEAVE TYPES PAGE ─────────────────────────────────
// HR admins use this page to:
// 1. View all leave types for the company
// 2. Create new leave types
// 3. Edit existing leave types
// 4. Deactivate leave types

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import {
  Plus, Edit, X, Save,
  ClipboardList, Check,
} from 'lucide-react';

import useWindowSize from '../../hooks/useWindowSize';

import {
  listLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deactivateLeaveType,
} from '../../api/leaveTypes';

// ─── TOGGLE SWITCH ────────────────────────────────────
// A yes/no toggle used in the form for boolean fields
const Toggle = ({ checked, onChange, label }) => (
  <label style={toggleStyles.wrap}>
    <div
      style={{
        ...toggleStyles.track,
        background: checked ? '#4F46E5' : '#D1D5DB',
      }}
      onClick={onChange}
    >
      <div style={{
        ...toggleStyles.thumb,
        transform: checked
          ? 'translateX(20px)'
          : 'translateX(2px)',
      }} />
    </div>
    <span style={toggleStyles.label}>{label}</span>
  </label>
);

const toggleStyles = {
  wrap: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.625rem',
    cursor:     'pointer',
  },
  track: {
    width:        '42px',
    height:       '24px',
    borderRadius: '9999px',
    position:     'relative',
    transition:   'background 0.2s',
    cursor:       'pointer',
    flexShrink:   0,
  },
  thumb: {
    position:     'absolute',
    top:          '2px',
    width:        '20px',
    height:       '20px',
    borderRadius: '50%',
    background:   'white',
    boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
    transition:   'transform 0.2s',
  },
  label: {
    fontSize:  '0.875rem',
    color:     'var(--gray-700)',
    fontWeight:'500',
  },
};

// ─── LEAVE TYPE MODAL ─────────────────────────────────
const LeaveTypeModal = ({ leaveType, onSave, onClose }) => {
  
  const isEditing = !!leaveType;

  const [formData, setFormData] = useState({
    name:                leaveType?.name                ?? '',
    description:         leaveType?.description         ?? '',
    default_days:        leaveType?.default_days        ?? 0,
    is_paid:             leaveType?.is_paid             ?? true,
    requires_approval:   leaveType?.requires_approval   ?? true,
    carry_over:          leaveType?.carry_over          ?? false,
    max_carry_over_days: leaveType?.max_carry_over_days ?? 0,
    allow_half_day:      leaveType?.allow_half_day      ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const toggleField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Leave type name is required.');
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
        {/* Header */}
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            {isEditing ? 'Edit Leave Type' : 'Create Leave Type'}
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">
                Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Annual Leave"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                placeholder="When should employees use this leave type?"
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Default Days */}
            <div className="form-group">
              <label className="form-label">
                Default Days Per Year
              </label>
              <input
                type="number"
                name="default_days"
                value={formData.default_days}
                onChange={handleChange}
                className="form-input"
                min={0}
                max={365}
              />
            </div>

            {/* Toggles */}
            <div style={styles.toggleGrid}>
              <Toggle
                checked={formData.is_paid}
                onChange={() => toggleField('is_paid')}
                label="Paid Leave"
              />
              <Toggle
                checked={formData.requires_approval}
                onChange={() => toggleField('requires_approval')}
                label="Requires Approval"
              />
              <Toggle
                checked={formData.allow_half_day}
                onChange={() => toggleField('allow_half_day')}
                label="Allow Half Days"
              />
              <Toggle
                checked={formData.carry_over}
                onChange={() => toggleField('carry_over')}
                label="Allow Carry Over"
              />
            </div>

            {/* Max Carry Over Days — only show if carry over on */}
            {formData.carry_over && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">
                  Max Carry Over Days
                  <span style={styles.hint}>
                    (0 = carry over all remaining days)
                  </span>
                </label>
                <input
                  type="number"
                  name="max_carry_over_days"
                  value={formData.max_carry_over_days}
                  onChange={handleChange}
                  className="form-input"
                  min={0}
                />
              </div>
            )}
          </div>

          {/* Footer */}
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
                  {isEditing ? 'Save Changes' : 'Create'}
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
const LeaveTypesPage = () => {
  const { isMobile } = useWindowSize();
  const [leaveTypes,  setLeaveTypes]  = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [actionId,    setActionId]    = useState(null);

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    try {
      const res = await listLeaveTypes();
      setLeaveTypes(res.data.leave_types || []);
    } catch {
      toast.error('Failed to load leave types.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLeaveTypes(); }, []);

  const handleCreate = async (data) => {
    try {
      await createLeaveType(data);
      toast.success('Leave type created!');
      setShowModal(false);
      fetchLeaveTypes();
    } catch (err) {
      toast.error(err.response?.data?.error
        || 'Failed to create leave type.');
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateLeaveType(editTarget.id, data);
      toast.success('Leave type updated!');
      setEditTarget(null);
      fetchLeaveTypes();
    } catch (err) {
      toast.error(err.response?.data?.error
        || 'Failed to update leave type.');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm(
      'Deactivate this leave type? Employees will no longer be able to apply for it.'
    )) return;
    setActionId(id);
    try {
      const res = await deactivateLeaveType(id);
      toast.success(res.data.message);
      if (res.data.warning) toast(res.data.warning);
      fetchLeaveTypes();
    } catch (err) {
      toast.error(err.response?.data?.error
        || 'Failed to deactivate.');
    } finally {
      setActionId(null);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Leave Types</h2>
          <p style={styles.pageSub}>
            Configure the leave categories for your company
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Create Leave Type
        </button>
      </div>

      {/* Leave Types Grid */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : leaveTypes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ClipboardList size={40} />
            <p style={{ fontWeight: 600 }}>
              No leave types yet
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowModal(true)}
            >
              <Plus size={14} />
              Create your first leave type
            </button>
          </div>
        </div>
      ) : (
        <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile
                      ? '1fr'
                      : 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '1.25rem',}}>

          {leaveTypes.map(lt => (
            <div key={lt.id} style={{
              ...styles.ltCard,
              opacity: lt.is_active ? 1 : 0.6,
            }}>
              {/* Card Header */}
              <div style={styles.ltHeader}>
                <div style={styles.ltIconWrap}>
                  <ClipboardList size={20} color="#4F46E5" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.ltName}>{lt.name}</h3>
                  {!lt.is_active && (
                    <span style={styles.inactiveBadge}>
                      Inactive
                    </span>
                  )}
                </div>
                {/* Edit and Deactivate buttons */}
                <div style={styles.ltActions}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditTarget(lt)}
                  >
                    <Edit size={13} />
                  </button>
                  {lt.is_active && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeactivate(lt.id)}
                      disabled={actionId === lt.id}
                    >
                      {actionId === lt.id ? (
                        <div className="spinner"
                          style={{ width: 12, height: 12,
                                   borderWidth: 2 }}
                        />
                      ) : (
                        <X size={13} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {lt.description && (
                <p style={styles.ltDesc}>{lt.description}</p>
              )}

              {/* Days */}
              <div style={styles.ltDays}>
                <span style={styles.ltDaysNum}>
                  {lt.default_days}
                </span>
                <span style={styles.ltDaysLabel}>
                  days per year
                </span>
              </div>

              {/* Feature Tags */}
              <div style={styles.ltTags}>
                {[
                  { label: 'Paid',       active: lt.is_paid            },
                  { label: 'Approval',   active: lt.requires_approval  },
                  { label: 'Half Day',   active: lt.allow_half_day     },
                  { label: 'Carry Over', active: lt.carry_over         },
                ].map(({ label, active }) => (
                  <span key={label} style={{
                    ...styles.ltTag,
                    background: active ? '#EEF2FF' : '#F3F4F6',
                    color:      active ? '#4F46E5' : '#9CA3AF',
                  }}>
                    {active && (
                      <Check size={10} style={{ flexShrink: 0 }} />
                    )}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <LeaveTypeModal
          leaveType={null}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
      {editTarget && (
        <LeaveTypeModal
          leaveType={editTarget}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.25rem',
  },
  ltCard: {
    background: 'white', borderRadius: '0.75rem',
    border: '1px solid var(--gray-200)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  ltHeader: {
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
  },
  ltIconWrap: {
    width: '40px', height: '40px', background: '#EEF2FF',
    borderRadius: '0.625rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ltName: {
    fontSize: '1rem', fontWeight: '700', color: 'var(--gray-800)',
  },
  inactiveBadge: {
    display: 'inline-block', marginTop: '0.25rem',
    fontSize: '0.7rem', background: '#FEE2E2',
    color: '#991B1B', padding: '1px 8px',
    borderRadius: '9999px', fontWeight: '600',
  },
  ltActions: { display: 'flex', gap: '0.5rem' },
  ltDesc: {
    fontSize: '0.8125rem', color: 'var(--gray-500)',
    lineHeight: 1.5,
  },
  ltDays: {
    display: 'flex', alignItems: 'baseline', gap: '0.375rem',
  },
  ltDaysNum: {
    fontSize: '2rem', fontWeight: '800', color: '#4F46E5',
    lineHeight: 1,
  },
  ltDaysLabel: { fontSize: '0.875rem', color: 'var(--gray-400)' },
  ltTags: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  ltTag: {
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
    padding: '3px 10px', borderRadius: '9999px',
    fontSize: '0.75rem', fontWeight: '500',
  },
  hint: {
    fontSize: '0.75rem', color: 'var(--gray-400)',
    marginLeft: '0.5rem', fontWeight: 400,
  },
  modalBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: 'white', borderRadius: '1rem',
    width: '100%', maxWidth: '500px',
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
  modalBody: { padding: '1.5rem', overflowY: 'auto', flex: 1 },
  toggleGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
    padding: '1rem', background: 'var(--gray-50)',
    borderRadius: '0.5rem',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '0.75rem', padding: '1rem 1.5rem',
    borderTop: '1px solid var(--gray-200)',
    background: 'var(--gray-50)',
  },
};

export default LeaveTypesPage;