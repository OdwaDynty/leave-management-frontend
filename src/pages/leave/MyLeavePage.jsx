// ─── MY LEAVE REQUESTS PAGE ───────────────────────────
// Employees use this page to:
// 1. Submit a new leave request
// 2. View all their past and current requests
// 3. Cancel a pending request

import { useState, useEffect }  from 'react';
import { toast }                from 'react-hot-toast';
import { format }               from 'date-fns';
import {
  Plus, X, FileText,
  Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  getMyLeaveRequests,
  submitLeaveRequest,
  cancelLeaveRequest,
} from '../../api/leaveRequests';
import { listLeaveTypes }  from '../../api/leaveTypes';
import { getMyBalances }   from '../../api/leaveBalances';

import useWindowSize from '../../hooks/useWindowSize';

// ─── STATUS BADGE ─────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status}</span>
);

// ─── MAIN COMPONENT ───────────────────────────────────

const MyLeavePage = () => {

  const { isMobile } = useWindowSize();
  // ── State ──────────────────────────────────────────
  const [requests,    setRequests]    = useState([]);
  const [leaveTypes,  setLeaveTypes]  = useState([]);
  const [balances,    setBalances]    = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [cancellingId,setCancellingId]= useState(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear,   setFilterYear]   = useState(
    new Date().getFullYear()
  );

  // Form state for new leave request
  const [formData, setFormData] = useState({
    leave_type_id:  '',
    start_date:     '',
    end_date:       '',
    reason:         '',
    is_half_day:    false,
    half_day_period:'morning',
  });

  // ── Fetch Data ─────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, typesRes, balRes] = await Promise.all([
        getMyLeaveRequests({
          status: filterStatus || undefined,
          year:   filterYear,
        }),
        listLeaveTypes({ is_active: true }),
        getMyBalances({ year: new Date().getFullYear() }),
      ]);
      setRequests(reqRes.data.leave_requests  || []);
      setLeaveTypes(typesRes.data.leave_types || []);
      setBalances(balRes.data.balances        || []);
    } catch (err) {
      toast.error('Failed to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterStatus, filterYear]);

  // ── Handle Form Input Changes ──────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ── Get Balance for Selected Leave Type ───────────
  // Shows the employee how many days they have left
  const selectedBalance = balances.find(
    b => b.leave_type_id === formData.leave_type_id ||
         b.leave_type_name === leaveTypes.find(
           t => t.id === formData.leave_type_id
         )?.name
  );

  // ── Submit New Leave Request ───────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leave_type_id ||
        !formData.start_date    ||
        !formData.end_date) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await submitLeaveRequest(formData);
      toast.success('Leave request submitted successfully!');
      setShowForm(false);
      // Reset the form
      setFormData({
        leave_type_id:   '',
        start_date:      '',
        end_date:        '',
        reason:          '',
        is_half_day:     false,
        half_day_period: 'morning',
      });
      // Refresh the list
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to submit request.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel a Leave Request ─────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm(
      'Are you sure you want to cancel this leave request?'
    )) return;

    setCancellingId(id);
    try {
      await cancelLeaveRequest(id);
      toast.success('Leave request cancelled.');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to cancel request.';
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>My Leave Requests</h2>
          <p style={styles.pageSub}>
            View and manage your leave applications
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <><ChevronUp size={16} /> Hide Form</>
          ) : (
            <><Plus size={16} /> Apply for Leave</>
          )}
        </button>
      </div>

      {/* ── Apply for Leave Form ── */}
      {showForm && (
        <div className="card">
          <h3 style={styles.formTitle}>New Leave Request</h3>

          <form onSubmit={handleSubmit}>
            
            <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile
                          ? '1fr'      // phone: inputs stack vertically one per row
                          : '1fr 1fr', // desktop: inputs sit side by side
                          gap: '0 1.5rem',}}>

              {/* Leave Type */}
              <div className="form-group">
                <label className="form-label">
                  Leave Type <span style={styles.required}>*</span>
                </label>
                <select
                  name="leave_type_id"
                  value={formData.leave_type_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.default_days} days/year)
                    </option>
                  ))}
                </select>
                {/* Show remaining balance for selected type */}
                {selectedBalance && (
                  <span style={styles.balanceHint}>
                    You have{' '}
                    <strong>
                      {parseFloat(selectedBalance.remaining_days)}
                    </strong>{' '}
                    days remaining
                  </span>
                )}
              </div>

              {/* Start Date */}
              <div className="form-group">
                <label className="form-label">
                  Start Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* End Date */}
              <div className="form-group">
                <label className="form-label">
                  End Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="form-input"
                  min={formData.start_date ||
                       new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Reason */}
              <div className="form-group">
                <label className="form-label">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Brief reason for leave"
                  className="form-input"
                />
              </div>
            </div>

            {/* Half Day Option */}
            <div style={styles.halfDayRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_half_day"
                  checked={formData.is_half_day}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                Half day request
              </label>

              {/* Show morning/afternoon only if half day checked */}
              {formData.is_half_day && (
                <select
                  name="half_day_period"
                  value={formData.half_day_period}
                  onChange={handleChange}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              )}
            </div>

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner"
                      style={{ width: 16, height: 16,
                               borderWidth: 2 }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="card" style={styles.filterCard}>
        
        <div style={{
                      display: 'flex',
                      alignItems: isMobile ? 'flex-start' : 'flex-end',
                      flexDirection: isMobile ? 'column' : 'row',
                      // phone: Status and Year stack vertically
                      // desktop: Status and Year sit side by side
                      gap:           '1rem',
                      flexWrap:      'wrap',}}>
          
          {/* Status Filter */}
          <div style={styles.filterGroup}>
            <label className="form-label">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ width: '160px' }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Year Filter */}
          <div style={styles.filterGroup}>
            <label className="form-label">Year</label>
            <select
              value={filterYear}
              onChange={e =>
                setFilterYear(parseInt(e.target.value))
              }
              className="form-select"
              style={{ width: '120px' }}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Result Count */}
          <div style={styles.resultCount}>
            {requests.length} request
            {requests.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* ── Requests Table ── */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <p style={{ fontWeight: 600 }}>No leave requests found</p>
            <p style={{ fontSize: '0.875rem' }}>
              {filterStatus
                ? `No ${filterStatus} requests for ${filterYear}`
                : `You haven't applied for leave in ${filterYear}`
              }
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(true)}
              style={{ marginTop: '0.5rem' }}
            >
              <Plus size={14} />
              Apply for Leave
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 500 }}>
                      {req.leave_type_name}
                      {req.is_half_day && (
                        <span style={styles.halfDayTag}>
                          Half day
                        </span>
                      )}
                    </td>
                    <td>
                      {format(
                        new Date(req.start_date), 'dd MMM yyyy'
                      )}
                    </td>
                    <td>
                      {format(
                        new Date(req.end_date), 'dd MMM yyyy'
                      )}
                    </td>
                    <td>{parseFloat(req.days_requested)}</td>
                    <td style={{ color: 'var(--gray-500)',
                                 maxWidth: '200px',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap' }}>
                      {req.reason || '—'}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>
                      {req.reviewed_by_name || '—'}
                    </td>
                    <td>
                      {/* Only show cancel button for pending */}
                      {req.status === 'pending' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(req.id)}
                          disabled={cancellingId === req.id}
                        >
                          {cancellingId === req.id ? (
                            <div className="spinner"
                              style={{ width: 12, height: 12,
                                       borderWidth: 2 }}
                            />
                          ) : (
                            <X size={12} />
                          )}
                          Cancel
                        </button>
                      )}
                      {/* Show rejection reason if rejected */}
                      {req.status === 'rejected' &&
                       req.rejection_reason && (
                        <span
                          title={req.rejection_reason}
                          style={styles.rejectionHint}
                        >
                          View reason
                        </span>
                      )}
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
  formTitle: {
    fontSize:     '1rem',
    fontWeight:   '600',
    marginBottom: '1.25rem',
    color:        'var(--gray-800)',
  },
  formGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '0 1.5rem',
  },
  required: {
    color: 'var(--danger)',
  },
  balanceHint: {
    fontSize:  '0.75rem',
    color:     'var(--primary)',
    marginTop: '0.25rem',
  },
  halfDayRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        '1rem',
    marginBottom:'1.25rem',
  },
  checkboxLabel: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.5rem',
    fontSize:   '0.875rem',
    color:      'var(--gray-700)',
    cursor:     'pointer',
  },
  checkbox: {
    width:  '16px',
    height: '16px',
    cursor: 'pointer',
  },
  formActions: {
    display:        'flex',
    justifyContent: 'flex-end',
    gap:            '0.75rem',
    marginTop:      '0.5rem',
  },
  filterCard: {
    padding: '1rem 1.5rem',
  },
  filterRow: {
    display:    'flex',
    alignItems: 'flex-end',
    gap:        '1.5rem',
  },
  filterGroup: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.375rem',
  },
  resultCount: {
    marginLeft: 'auto',
    fontSize:   '0.875rem',
    color:      'var(--gray-500)',
    alignSelf:  'center',
  },
  halfDayTag: {
    display:       'inline-block',
    marginLeft:    '0.5rem',
    fontSize:      '0.7rem',
    background:    'var(--primary-light)',
    color:         'var(--primary)',
    padding:       '1px 6px',
    borderRadius:  '9999px',
    fontWeight:    '500',
  },
  rejectionHint: {
    fontSize:    '0.75rem',
    color:       'var(--danger)',
    cursor:      'help',
    fontWeight:  '500',
  },
};

export default MyLeavePage;