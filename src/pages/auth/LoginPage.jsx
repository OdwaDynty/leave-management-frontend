// ─── LOGIN PAGE ───────────────────────────────────────
// The first page users see when not logged in
// Handles email/password login and redirects to dashboard

import { useState }        from 'react';
import { Link }            from 'react-router-dom';
import { toast }           from 'react-hot-toast';
import { LogIn, Mail, Lock, Briefcase } from 'lucide-react';
import { login }           from '../../api/auth';
import { useAuth }         from '../../context/AuthContext';

import useWindowSize from '../../hooks/useWindowSize';

const LoginPage = () => {

const { isMobile } = useWindowSize();

  // ── Form State ─────────────────────────────────────
  const [formData, setFormData] = useState({
    email:    '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser } = useAuth();

  // ── Handle Input Changes ───────────────────────────
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ── Handle Form Submit ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(formData);
      const { token, user } = response.data;

      // Save token and user to context and localStorage
      loginUser(token, user);

      toast.success(`Welcome back, ${user.first_name}!`);

      // Redirect to dashboard
      window.location.href = '/dashboard';

    } catch (err) {
      // Show the error message from the API
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={{
                   display:   'flex',
                   minHeight: '100vh',
                   background:'var(--gray-50)',}}>
                    
      {/* ── Left Panel — Branding ── */}
      
      {!isMobile && (
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoWrap}>
            <Briefcase size={40} color="white" />
          </div>
          <h1 style={styles.brandTitle}>LeaveSync</h1>
          <p style={styles.brandSubtitle}>
            Enterprise Leave Management for modern teams
          </p>
          <div style={styles.featureList}>
            {[
              'Manage leave requests effortlessly',
              'Real-time approval workflows',
              'Detailed reports and insights',
              'South African labour law compliant',
            ].map((feature, i) => (
              <div key={i} style={styles.featureItem}>
                <div style={styles.featureDot} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── Right Panel — Login Form ── */}

      <div style={{
                    ...styles.rightPanel,
                    padding: isMobile ? '1.5rem 1rem' : '2rem',}}>

        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={styles.inputWrap}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="email"
                  autoFocus
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
                  placeholder="Enter your password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              {isLoading ? (
                <>
                  <div className="spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Forgot password link */}
          <div style={{ textAlign: 'right', marginTop: '-0.5rem',
              marginBottom: '1rem' }}>
          <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.875rem',
                  color: 'var(--primary)' }}>
           Forgot password?
          </Link>
          </div>
      
          {/* Register Link */}
          <p style={styles.registerLink}>
            Don't have an account?{' '}
            <Link to="/register">Register your company</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
  page: {
    display:       'flex',
    minHeight:     '100vh',
    background:    'var(--gray-50)',
  },
  leftPanel: {
    flex:           '0 0 45%',
    background:     'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '3rem',
  },
  brandContent: {
    color:     'white',
    maxWidth:  '400px',
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
    fontSize:     '1.125rem',
    opacity:      0.85,
    marginBottom: '2.5rem',
    lineHeight:   1.6,
  },
  featureList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '1rem',
  },
  featureItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
    opacity:    0.9,
    fontSize:   '0.95rem',
  },
  featureDot: {
    width:        '8px',
    height:       '8px',
    borderRadius: '50%',
    background:   'rgba(255,255,255,0.7)',
    flexShrink:   0,
  },
  rightPanel: {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '2rem',
  },
  formCard: {
    width:         '100%',
    maxWidth:      '420px',
    background:    'white',
    borderRadius:  '1rem',
    padding:       '2.5rem',
    boxShadow:     '0 10px 25px rgba(0,0,0,0.08)',
    border:        '1px solid var(--gray-200)',
  },
  formHeader: {
    marginBottom: '2rem',
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
    position:  'absolute',
    left:      '0.75rem',
    top:       '50%',
    transform: 'translateY(-50%)',
    color:     'var(--gray-400)',
    pointerEvents: 'none',
  },

  registerLink: {
    textAlign:  'center',
    marginTop:  '1.5rem',
    fontSize:   '0.875rem',
    color:      'var(--gray-500)',
  },
};

export default LoginPage;