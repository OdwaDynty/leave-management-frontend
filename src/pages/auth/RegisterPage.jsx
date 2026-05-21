// ─── REGISTER PAGE ────────────────────────────────────
// New company registration page
// Creates the company AND the first super_admin user
// in a single API call

import { useState }   from 'react';
import { Link }       from 'react-router-dom';
import { toast }      from 'react-hot-toast';
import { UserPlus, Mail, Lock, Building, Globe, User, Briefcase } from 'lucide-react';
import { register }   from '../../api/auth';
import { useAuth }    from '../../context/AuthContext';

import useWindowSize from '../../hooks/useWindowSize';

const RegisterPage = () => {

  const { isMobile } = useWindowSize();
  // ── Form State ─────────────────────────────────────
  const [formData, setFormData] = useState({
    company_name: '',
    subdomain:    '',
    first_name:   '',
    last_name:    '',
    email:        '',
    password:     '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser } = useAuth();

  // ── Auto-generate Subdomain ────────────────────────
  // When the user types a company name we automatically
  // suggest a subdomain by converting to lowercase
  // and replacing spaces with hyphens
  const handleCompanyNameChange = (e) => {
    const name      = e.target.value;
    const subdomain = name
      .toLowerCase()
      .replace(/\s+/g, '-')       // spaces → hyphens
      .replace(/[^a-z0-9-]/g, '') // remove special chars
      .substring(0, 30);          // max 30 chars

    setFormData(prev => ({
      ...prev,
      company_name: name,
      subdomain,
    }));
  };

  // ── Handle Other Input Changes ─────────────────────
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ── Handle Form Submit ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const { company_name, subdomain, first_name,
            last_name, email, password } = formData;

    if (!company_name || !subdomain || !first_name ||
        !last_name || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(formData);
      const { token, user } = response.data;

      loginUser(token, user);
      toast.success('Company registered successfully! Welcome aboard.');
      window.location.href = '/dashboard';

    } catch (err) {
      const message = err.response?.data?.error
        || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ── Left Panel — Branding ── */}
      {!isMobile && (
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoWrap}>
            <Briefcase size={40} color="white" />
          </div>
          <h1 style={styles.brandTitle}>LeaveSync</h1>
          <p style={styles.brandSubtitle}>
            Set up your company in minutes and start managing leave today.
          </p>
          <div style={styles.stepList}>
            {[
              { step: '1', text: 'Create your company account' },
              { step: '2', text: 'Add your employees' },
              { step: '3', text: 'Set up leave types and policies' },
              { step: '4', text: 'Start approving leave requests' },
            ].map((item) => (
              <div key={item.step} style={styles.stepItem}>
                <div style={styles.stepNumber}>{item.step}</div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── Right Panel — Register Form ── */}
      <div style={{
                    ...styles.rightPanel,
                    padding: isMobile ? '1.5rem 1rem' : '2rem',}}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Register your company</h2>
            <p style={styles.formSubtitle}>
              Get started with a free account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div style={styles.inputWrap}>
                <Building size={16} style={styles.inputIcon} />
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleCompanyNameChange}
                  placeholder="Acme Corporation"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Subdomain */}
            <div className="form-group">
              <label className="form-label">Subdomain</label>
              <div style={styles.inputWrap}>
                <Globe size={16} style={styles.inputIcon} />
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="acme"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <span style={styles.hint}>
                Your portal: {formData.subdomain || 'yourcompany'}.leavesync.co.za
              </span>
            </div>

            {/* First and Last Name */}

            <div style={{
                        display:             'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap:                 '1rem',}}>

              <div className="form-group">
                <label className="form-label">First Name</label>
                <div style={styles.inputWrap}>
                  <User size={16} style={styles.inputIcon} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Odwa"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Dlamini"
                  className="form-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={styles.inputWrap}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="odwa@company.com"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={styles.inputWrap}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isLoading ? (
                <>
                  <div className="spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
  page: {
    display:   'flex',
    minHeight: '100vh',
    background: 'var(--gray-50)',
  },
  leftPanel: {
    flex:           '0 0 40%',
    background:     'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '3rem',
  },
  brandContent: {
    color:    'white',
    maxWidth: '380px',
  },
  logoWrap: {
    width:          '72px',
    height:         '72px',
    background:     'rgba(255,255,255,0.2)',
    borderRadius:   '1rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   '1.5rem',
  },
  brandTitle: {
    fontSize:     '2.5rem',
    fontWeight:   '700',
    marginBottom: '0.75rem',
    color:        'white',
  },
  brandSubtitle: {
    fontSize:     '1rem',
    opacity:      0.85,
    marginBottom: '2rem',
    lineHeight:   1.6,
  },
  stepList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '1rem',
  },
  stepItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
    opacity:    0.9,
    fontSize:   '0.9rem',
  },
  stepNumber: {
    width:          '28px',
    height:         '28px',
    borderRadius:   '50%',
    background:     'rgba(255,255,255,0.25)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     '700',
    fontSize:       '0.8rem',
    flexShrink:     0,
  },
  rightPanel: {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '2rem',
    overflowY:      'auto',
  },
  formCard: {
    width:        '100%',
    maxWidth:     '460px',
    background:   'white',
    borderRadius: '1rem',
    padding:      '2.5rem',
    boxShadow:    '0 10px 25px rgba(0,0,0,0.08)',
    border:       '1px solid var(--gray-200)',
    margin:       '2rem 0',
  },
  formHeader: {
    marginBottom: '1.75rem',
  },
  formTitle: {
    fontSize:     '1.75rem',
    fontWeight:   '700',
    color:        'var(--gray-900)',
    marginBottom: '0.5rem',
  },
  formSubtitle: {
    color:    'var(--gray-500)',
    fontSize: '0.95rem',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position:      'absolute',
    left:          '0.75rem',
    top:           '50%',
    transform:     'translateY(-50%)',
    color:         'var(--gray-400)',
    pointerEvents: 'none',
  },
  hint: {
    fontSize: '0.75rem',
    color:    'var(--gray-400)',
    marginTop: '0.25rem',
  },
  loginLink: {
    textAlign:  'center',
    marginTop:  '1.5rem',
    fontSize:   '0.875rem',
    color:      'var(--gray-500)',
  },
};

export default RegisterPage;