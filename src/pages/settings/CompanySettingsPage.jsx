// ─── COMPANY SETTINGS PAGE ────────────────────────────
// Super admin uses this page to manage company settings
// All authenticated users can VIEW settings
// Only super_admin can EDIT settings
//
// Sections:
//   1. Company profile (name, logo, contact info)
//   2. Plan information (current plan, employee count)
//   3. Danger zone (future: delete company)

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { Building, Save,
         Edit, X, Users,
         Calendar, Shield }    from 'lucide-react';

import useWindowSize from '../../hooks/useWindowSize';

import { getCompanySettings,
         updateCompanySettings } from '../../api/company';
import { useAuth }               from '../../context/AuthContext';
import { format }                from 'date-fns';

// ─── PLAN BADGE ───────────────────────────────────────
// Shows the current subscription plan with colour
const PlanBadge = ({ plan }) => {
  const config = {
    free:         { bg: '#F3F4F6', color: '#374151',
                    label: 'Free' },
    starter:      { bg: '#DBEAFE', color: '#1E40AF',
                    label: 'Starter' },
    professional: { bg: '#EDE9FE', color: '#5B21B6',
                    label: 'Professional' },
    enterprise:   { bg: '#FEF3C7', color: '#92400E',
                    label: 'Enterprise' },
  }[plan] || { bg: '#F3F4F6', color: '#374151',
               label: plan };

  return (
    <span style={{
      display:      'inline-block',
      padding:      '4px 14px',
      borderRadius: '9999px',
      fontSize:     '0.8125rem',
      fontWeight:   '700',
      background:   config.bg,
      color:        config.color,
    }}>
      {config.label} Plan
    </span>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────
const CompanySettingsPage = () => {
  const { user, hasRole } = useAuth();

  const { isMobile } = useWindowSize();

  // ── State ──────────────────────────────────────────
  const [company,   setCompany]   = useState(null);
  const [stats,     setStats]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);

  // Form state — populated from company data
  const [formData, setFormData] = useState({
    name:          '',
    contact_email: '',
    contact_phone: '',
    address:       '',
    logo_url:      '',
  });

  // ── Fetch Company Settings ─────────────────────────
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await getCompanySettings();
      setCompany(res.data.company);
      setStats(res.data.stats);

      // Pre-populate form with current values
      setFormData({
        name:          res.data.company.name          || '',
        contact_email: res.data.company.contact_email || '',
        contact_phone: res.data.company.contact_phone || '',
        address:       res.data.company.address       || '',
        logo_url:      res.data.company.logo_url      || '',
      });
    } catch {
      toast.error('Failed to load company settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  // ── Handle Save ────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Company name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateCompanySettings(formData);
      setCompany(res.data.company);
      setIsEditing(false);
      toast.success('Company settings saved successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.error
        || 'Failed to save settings.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cancel Edit ────────────────────────────────────
  const handleCancel = () => {
    // Reset form to current company values
    setFormData({
      name:          company.name          || '',
      contact_email: company.contact_email || '',
      contact_phone: company.contact_phone || '',
      address:       company.address       || '',
      logo_url:      company.logo_url      || '',
    });
    setIsEditing(false);
  };

  // ── Can Edit ───────────────────────────────────────
  // Only super_admin can edit company settings
  const canEdit = hasRole('super_admin');

  // ── Render ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.titleRow}>
          <div style={styles.titleIcon}>
            <Building size={22} color="#4F46E5" />
          </div>
          <div>
            <h2 style={styles.pageTitle}>
              Company Settings
            </h2>
            <p style={styles.pageSub}>
              Manage your company profile and settings
            </p>
          </div>
        </div>

        {/* Edit / Save buttons — super_admin only */}
        {canEdit && (
          <div style={styles.headerBtns}>
            {isEditing ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X size={15} />
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="spinner"
                        style={{ width: 14, height: 14,
                                 borderWidth: 2 }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <Edit size={15} />
                Edit Settings
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Plan Summary Cards ── */}
      <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: '1rem',}}>

        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>
            <Users size={20} color="#4F46E5" />
          </div>
          <p style={styles.statValue}>
            {stats?.total_employees || 0}
          </p>
          <p style={styles.statLabel}>
            Active Employees
          </p>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            background: '#FEF3C7',
          }}>
            <Shield size={20} color="#D97706" />
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <PlanBadge plan={company?.plan} />
          </div>
          <p style={styles.statLabel}>
            Current Plan
          </p>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            background: '#D1FAE5',
          }}>
            <Calendar size={20} color="#059669" />
          </div>
          <p style={styles.statValue}>
            {company?.created_at
              ? format(
                  new Date(company.created_at),
                  'MMM yyyy'
                )
              : '—'
            }
          </p>
          <p style={styles.statLabel}>
            Member Since
          </p>
        </div>
      </div>

      {/* ── Company Profile ── */}
      <div className="card">
        <h3 style={styles.sectionTitle}>
          Company Profile
        </h3>

        {isEditing ? (
          // ── Edit Form ──────────────────────────────
          <form onSubmit={handleSave}>
            <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                          gap: '0 1.5rem',}}>

              {/* Company Name */}
              <div className="form-group">
                <label className="form-label">
                  Company Name{' '}
                  <span style={{ color: 'var(--danger)' }}>
                    *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({
                    ...p, name: e.target.value
                  }))}
                  className="form-input"
                  placeholder="Acme Corporation"
                  required
                  autoFocus
                />
              </div>

              {/* Contact Email */}
              <div className="form-group">
                <label className="form-label">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={e => setFormData(p => ({
                    ...p, contact_email: e.target.value
                  }))}
                  className="form-input"
                  placeholder="hr@company.com"
                />
              </div>

              {/* Contact Phone */}
              <div className="form-group">
                <label className="form-label">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={e => setFormData(p => ({
                    ...p, contact_phone: e.target.value
                  }))}
                  className="form-input"
                  placeholder="+27 11 123 4567"
                />
              </div>

              {/* Logo URL */}
              <div className="form-group">
                <label className="form-label">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={e => setFormData(p => ({
                    ...p, logo_url: e.target.value
                  }))}
                  className="form-input"
                  placeholder="https://yourcompany.com/logo.png"
                />
              </div>
            </div>

            {/* Address — full width */}
            <div className="form-group">
              <label className="form-label">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={e => setFormData(p => ({
                  ...p, address: e.target.value
                }))}
                className="form-input"
                placeholder="123 Main Street, Cape Town, 8001"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </form>

        ) : (
          // ── Display Mode ───────────────────────────
          <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: '1.5rem',}}>

            <div style={styles.displayItem}>
              <p style={styles.displayLabel}>
                Company Name
              </p>
              <p style={styles.displayValue}>
                {company?.name || '—'}
              </p>
            </div>

            <div style={styles.displayItem}>
              <p style={styles.displayLabel}>
                Subdomain
              </p>
              <p style={styles.displayValue}>
                <code style={styles.codeText}>
                  {company?.subdomain}
                </code>
                .leavesync.co.za
              </p>
            </div>

            <div style={styles.displayItem}>
              <p style={styles.displayLabel}>
                Contact Email
              </p>
              <p style={styles.displayValue}>
                {company?.contact_email || (
                  <span style={{ color: 'var(--gray-400)' }}>
                    Not set
                  </span>
                )}
              </p>
            </div>

            <div style={styles.displayItem}>
              <p style={styles.displayLabel}>
                Contact Phone
              </p>
              <p style={styles.displayValue}>
                {company?.contact_phone || (
                  <span style={{ color: 'var(--gray-400)' }}>
                    Not set
                  </span>
                )}
              </p>
            </div>

            {/* Logo preview if set */}
            {company?.logo_url && (
              <div style={styles.displayItem}>
                <p style={styles.displayLabel}>Logo</p>
                <img
                  src={company.logo_url}
                  alt="Company logo"
                  style={styles.logoPreview}
                  onError={e => {
                    // Hide broken image
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {company?.address && (
              <div style={{
                ...styles.displayItem,
                gridColumn: '1 / -1',
              }}>
                <p style={styles.displayLabel}>Address</p>
                <p style={styles.displayValue}>
                  {company.address}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Account Info ── */}
      <div className="card">
        <h3 style={styles.sectionTitle}>
          Account Information
        </h3>
        <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap:  '1.5rem',}}>

          <div style={styles.displayItem}>
            <p style={styles.displayLabel}>
              Account Status
            </p>
            <span style={{
              display:      'inline-block',
              padding:      '3px 10px',
              borderRadius: '9999px',
              fontSize:     '0.8125rem',
              fontWeight:   '600',
              background:   company?.status === 'active'
                ? '#D1FAE5' : '#FEE2E2',
              color: company?.status === 'active'
                ? '#065F46' : '#991B1B',
            }}>
              {company?.status === 'active'
                ? 'Active' : 'Suspended'}
            </span>
          </div>

          <div style={styles.displayItem}>
            <p style={styles.displayLabel}>Company ID</p>
            <p style={{
              ...styles.displayValue,
              fontSize:   '0.75rem',
              color:      'var(--gray-400)',
              fontFamily: 'monospace',
            }}>
              {company?.id}
            </p>
          </div>

          <div style={styles.displayItem}>
            <p style={styles.displayLabel}>
              Created On
            </p>
            <p style={styles.displayValue}>
              {company?.created_at
                ? format(
                    new Date(company.created_at),
                    'dd MMMM yyyy'
                  )
                : '—'
              }
            </p>
          </div>

          <div style={styles.displayItem}>
            <p style={styles.displayLabel}>
              Last Updated
            </p>
            <p style={styles.displayValue}>
              {company?.updated_at
                ? format(
                    new Date(company.updated_at),
                    'dd MMM yyyy, HH:mm'
                  )
                : '—'
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── Plan Info ── */}
      <div className="card">
        <h3 style={styles.sectionTitle}>
          Subscription Plan
        </h3>
        <div style={styles.planInfo}>
          <PlanBadge plan={company?.plan} />
          <div style={styles.planDetails}>
            {/* Plan features */}
            {[
              { free:         'Up to 5 employees',
                starter:      'Up to 25 employees',
                professional: 'Up to 100 employees',
                enterprise:   'Unlimited employees',
              }[company?.plan],
              'Leave management',
              'Reports and analytics',
              company?.plan !== 'free'
                ? 'Priority support' : null,
            ].filter(Boolean).map((feature, i) => (
              <div key={i} style={styles.planFeature}>
                <span style={styles.checkmark}>✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Upgrade prompt for free plan */}
          {company?.plan === 'free' && (
            <div style={styles.upgradeBanner}>
              <p style={styles.upgradeText}>
                You are on the free plan.
                Upgrade to unlock more employees
                and premium features.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => toast(
                  'Billing coming soon!',
                  { icon: '🚀' }
                )}
              >
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
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
  headerBtns: {
    display: 'flex',
    gap:     '0.75rem',
  },
  statsGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap:                 '1rem',
  },
  statCard: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    textAlign:      'center',
    padding:        '1.5rem',
    gap:            '0.5rem',
  },
  statIcon: {
    width:          '48px',
    height:         '48px',
    background:     '#EEF2FF',
    borderRadius:   '0.75rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize:   '1.5rem',
    fontWeight: '800',
    color:      'var(--gray-900)',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.8125rem',
    color:    'var(--gray-500)',
    fontWeight:'500',
  },
  sectionTitle: {
    fontSize:     '1rem',
    fontWeight:   '700',
    color:        'var(--gray-800)',
    marginBottom: '1.5rem',
    paddingBottom:'0.875rem',
    borderBottom: '1px solid var(--gray-100)',
  },
  formGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '0 1.5rem',
  },
  displayGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '1.5rem',
  },
  displayItem: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.375rem',
  },
  displayLabel: {
    fontSize:   '0.75rem',
    fontWeight: '600',
    color:      'var(--gray-400)',
    textTransform:'uppercase',
    letterSpacing:'0.05em',
  },
  displayValue: {
    fontSize:   '0.9375rem',
    fontWeight: '500',
    color:      'var(--gray-800)',
  },
  codeText: {
    background:   'var(--gray-100)',
    padding:      '1px 6px',
    borderRadius: '4px',
    fontSize:     '0.875rem',
    fontFamily:   'monospace',
    color:        '#4F46E5',
  },
  logoPreview: {
    height:       '48px',
    maxWidth:     '200px',
    objectFit:    'contain',
    borderRadius: '0.375rem',
    border:       '1px solid var(--gray-200)',
    padding:      '4px',
  },
  planInfo: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '1.25rem',
  },
  planDetails: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.625rem',
  },
  planFeature: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.5rem',
    fontSize:   '0.875rem',
    color:      'var(--gray-700)',
  },
  checkmark: {
    color:      '#10B981',
    fontWeight: '700',
    fontSize:   '1rem',
  },
  upgradeBanner: {
    background:    '#EEF2FF',
    border:        '1px solid #C7D2FE',
    borderRadius:  '0.75rem',
    padding:       '1.25rem',
    display:       'flex',
    justifyContent:'space-between',
    alignItems:    'center',
    gap:           '1rem',
    marginTop:     '0.5rem',
  },
  upgradeText: {
    fontSize:  '0.875rem',
    color:     '#3730A3',
    lineHeight:1.5,
    flex:      1,
  },
};

export default CompanySettingsPage;