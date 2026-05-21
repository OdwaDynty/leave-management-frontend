// ─── EMPLOYEE MANAGEMENT PAGE ─────────────────────────
// HR admins use this page to:
// 1. View all employees in the company
// 2. Add a new employee
// 3. Edit an employee's details
// 4. Deactivate or reactivate an employee

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import {
  Plus, Search, UserCheck,
  UserX, Edit, X, Save, Eye,
} from 'lucide-react';
import {
  listEmployees,
  addEmployee,
  updateEmployee,
  deactivateEmployee,
  reactivateEmployee,
} from '../../api/employees';
import Avatar from '../../components/ui/Avatar';

import useWindowSize from '../../hooks/useWindowSize';

// ─── ROLE BADGE ───────────────────────────────────────

const RoleBadge = ({ role }) => {
  const colors = {
    super_admin: { bg: '#EDE9FE', color: '#5B21B6' },
    hr_admin:    { bg: '#DBEAFE', color: '#1E40AF' },
    manager:     { bg: '#D1FAE5', color: '#065F46' },
    employee:    { bg: '#F3F4F6', color: '#374151' },
  };
  const style = colors[role] || colors.employee;
  const label = {
    super_admin: 'Super Admin',
    hr_admin:    'HR Admin',
    manager:     'Manager',
    employee:    'Employee',
  }[role] || role;

  return (
    <span style={{
      ...badgeStyle,
      background: style.bg,
      color:      style.color,
    }}>
      {label}
    </span>
  );
};

const badgeStyle = {
  display:       'inline-flex',
  alignItems:    'center',
  padding:       '2px 10px',
  borderRadius:  '9999px',
  fontSize:      '0.75rem',
  fontWeight:    '600',
};

// ─── ADD / EDIT EMPLOYEE MODAL ────────────────────────
const EmployeeModal = ({ employee, onSave, onClose }) => {
  // If employee is passed in we are editing
  // If null we are adding a new employee
  const isEditing = !!employee;

  const [formData, setFormData] = useState({
    first_name:  employee?.first_name  || '',
    last_name:   employee?.last_name   || '',
    email:       employee?.email       || '',
    password:    '',
    role:        employee?.role        || 'employee',
    department:  employee?.department  || '',
    job_title:   employee?.job_title   || '',
    phone:       employee?.phone       || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password only required when adding new employee
    if (!isEditing && !formData.password) {
      toast.error('Password is required for new employees.');
      return;
    }

    setSaving(true);
    try {
      // Remove empty password field when editing
      const payload = { ...formData };
      if (isEditing && !payload.password) {
        delete payload.password;
      }
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <button
            onClick={onClose}
            style={styles.modalClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>

            {/* First and Last Name */}

            <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                          gap: '0 1rem',}}>

              <div className="form-group">
                <label className="form-label">
                  First Name <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Thabo"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Last Name <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nkosi"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email <span style={styles.req}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="thabo@company.com"
                // Cannot change email when editing
                readOnly={isEditing}
                style={isEditing ? {
                  background: 'var(--gray-50)',
                  color: 'var(--gray-400)',
                } : {}}
                required
              />
            </div>

            {/* Password — only shown when adding */}
            {!isEditing && (
              <div className="form-group">
                <label className="form-label">
                  Password <span style={styles.req}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>
            )}

            {/* Role and Department */}

            <div style={{
                          display:  'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                          gap: '0 1rem',}}>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr_admin">HR Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Engineering"
                />
              </div>
            </div>

            {/* Job Title and Phone */}

            <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                          gap: '0 1rem',}}>

              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Software Developer"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+27 82 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
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
                  {isEditing ? 'Save Changes' : 'Add Employee'}
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
const EmployeesPage = () => {
  const { isMobile } = useWindowSize();
  const [employees,   setEmployees]   = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterRole,  setFilterRole]  = useState('');
  const [filterStatus,setFilterStatus]= useState('true');
  const [showModal,   setShowModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [actionId,    setActionId]    = useState(null);

  // ── Fetch Employees ────────────────────────────────
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await listEmployees({
        is_active: filterStatus || undefined,
        role:      filterRole   || undefined,
      });
      setEmployees(res.data.employees || []);
    } catch {
      toast.error('Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filterRole, filterStatus]);

  // ── Client-side Search ─────────────────────────────
  // Filter employees by name or email as user types
  const filtered = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (
      emp.first_name.toLowerCase().includes(term) ||
      emp.last_name.toLowerCase().includes(term)  ||
      emp.email.toLowerCase().includes(term)      ||
      (emp.department || '').toLowerCase().includes(term)
    );
  });

  // ── Add Employee ───────────────────────────────────
  const handleAdd = async (data) => {
    try {
      await addEmployee(data);
      toast.success('Employee added successfully!');
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to add employee.';
      toast.error(msg);
    }
  };

  // ── Edit Employee ──────────────────────────────────
  const handleEdit = async (data) => {
    try {
      await updateEmployee(editTarget.id, data);
      toast.success('Employee updated successfully!');
      setEditTarget(null);
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to update employee.';
      toast.error(msg);
    }
  };

  // ── Deactivate Employee ────────────────────────────
  const handleDeactivate = async (id) => {
    if (!window.confirm(
      'Deactivate this employee? They will no longer be able to log in.'
    )) return;

    setActionId(id);
    try {
      await deactivateEmployee(id);
      toast.success('Employee deactivated.');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error
        || 'Failed to deactivate.');
    } finally {
      setActionId(null);
    }
  };

  // ── Reactivate Employee ────────────────────────────
  const handleReactivate = async (id) => {
    setActionId(id);
    try {
      await reactivateEmployee(id);
      toast.success('Employee reactivated.');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error
        || 'Failed to reactivate.');
    } finally {
      setActionId(null);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Employee Management</h2>
          <p style={styles.pageSub}>
            {employees.length} employee
            {employees.length !== 1 ? 's' : ''} in your company
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* ── Filters and Search ── */}
      <div className="card" style={styles.filterCard}>
        {/* Search */}
        <div style={styles.searchWrap}>
          <Search
            size={16}
            style={styles.searchIcon}
          />
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'flex-end',
                      gap: '1rem',}}>

          {/* Role Filter */}
          <div style={styles.filterGroup}>
            <label className="form-label">Role</label>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="form-select"
              style={{ width: '160px' }}
            >
              <option value="">All roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr_admin">HR Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={styles.filterGroup}>
            <label className="form-label">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ width: '140px' }}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Result Count */}
          <div style={styles.resultCount}>
            Showing {filtered.length} of {employees.length}
          </div>
        </div>
      </div>

      {/* ── Employees Table ── */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <p style={{ fontWeight: 600 }}>No employees found</p>
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm
                ? `No results for "${searchTerm}"`
                : 'No employees match the selected filters'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    {/* Employee Name + Email */}
                    <td>
                      <div style={styles.empCell}>
                        <Avatar
                          name={`${emp.first_name} ${emp.last_name}`}
                          size={34}
                        />
                        <div>
                          <p style={styles.empName}>
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p style={styles.empEmail}>
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td>
                      <RoleBadge role={emp.role} />
                    </td>

                    {/* Department */}
                    <td style={{ color: 'var(--gray-500)' }}>
                      {emp.department || '—'}
                    </td>

                    {/* Job Title */}
                    <td style={{ color: 'var(--gray-500)' }}>
                      {emp.job_title || '—'}
                    </td>

                    {/* Active Status */}
                    <td>
                      <span style={{
                        ...badgeStyle,
                        background: emp.is_active
                          ? '#D1FAE5' : '#FEE2E2',
                        color: emp.is_active
                          ? '#065F46' : '#991B1B',
                      }}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td>
                      <div style={styles.actionBtns}>
                        {/* Edit Button */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditTarget(emp)}
                          title="Edit employee"
                        >
                          <Edit size={13} />
                        </button>

                        {/* Deactivate / Reactivate */}
                        {emp.is_active ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDeactivate(emp.id)
                            }
                            disabled={actionId === emp.id}
                            title="Deactivate employee"
                          >
                            {actionId === emp.id ? (
                              <div className="spinner"
                                style={{ width: 12,
                                         height: 12,
                                         borderWidth: 2 }}
                              />
                            ) : (
                              <UserX size={13} />
                            )}
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleReactivate(emp.id)
                            }
                            disabled={actionId === emp.id}
                            title="Reactivate employee"
                          >
                            {actionId === emp.id ? (
                              <div className="spinner"
                                style={{ width: 12,
                                         height: 12,
                                         borderWidth: 2 }}
                              />
                            ) : (
                              <UserCheck size={13} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Employee Modal ── */}
      {showModal && (
        <EmployeeModal
          employee={null}
          onSave={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Edit Employee Modal ── */}
      {editTarget && (
        <EmployeeModal
          employee={editTarget}
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
  filterCard: {
    padding:       '1.25rem 1.5rem',
    display:       'flex',
    flexDirection: 'column',
    gap:           '1rem',
  },
  searchWrap: {
    position: 'relative',
  },
  searchIcon: {
    position:      'absolute',
    left:          '0.75rem',
    top:           '50%',
    transform:     'translateY(-50%)',
    color:         'var(--gray-400)',
    pointerEvents: 'none',
  },
  filterRow: {
    display:    'flex',
    alignItems: 'flex-end',
    gap:        '1rem',
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
  empCell: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
  },
  empName: {
    fontWeight:   '600',
    fontSize:     '0.875rem',
    color:        'var(--gray-800)',
    marginBottom: '0.125rem',
  },
  empEmail: {
    fontSize: '0.75rem',
    color:    'var(--gray-400)',
  },
  actionBtns: {
    display: 'flex',
    gap:     '0.5rem',
  },
  twoCol: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '0 1rem',
  },
  req: {
    color: 'var(--danger)',
  },

  // Modal
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
    background:   'white',
    borderRadius: '1rem',
    width:        '100%',
    maxWidth:     '560px',
    boxShadow:    '0 25px 50px rgba(0,0,0,0.25)',
    maxHeight:    '90vh',
    overflow:     'hidden',
    display:      'flex',
    flexDirection:'column',
  },
  modalHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '1.25rem 1.5rem',
    borderBottom:   '1px solid var(--gray-200)',
  },
  modalTitle: {
    fontSize:   '1.125rem',
    fontWeight: '700',
    color:      'var(--gray-900)',
  },
  modalClose: {
    background:   'transparent',
    border:       'none',
    color:        'var(--gray-400)',
    cursor:       'pointer',
    padding:      '0.25rem',
    borderRadius: '0.375rem',
    display:      'flex',
  },
  modalBody: {
    padding:   '1.5rem',
    overflowY: 'auto',
    flex:      1,
  },
  modalFooter: {
    display:        'flex',
    justifyContent: 'flex-end',
    gap:            '0.75rem',
    padding:        '1rem 1.5rem',
    borderTop:      '1px solid var(--gray-200)',
    background:     'var(--gray-50)',
  },
};

export default EmployeesPage;