// ─── FORGOT PASSWORD PAGE ─────────────────────────────
// Public page — accessible without login
// User enters their email address and if it exists
// in the system they receive a password reset link
//
// Security: We show the same message whether the email
// exists or not — prevents email enumeration attacks

import { useState }   from 'react';
import { Link }       from 'react-router-dom';
import { toast }      from 'react-hot-toast';
import { Mail, ArrowLeft, Briefcase } from 'lucide-react';
import { forgotPassword } from '../../api/auth';

import useWindowSize from '../../hooks/useWindowSize';

const ForgotPasswordPage = () => {

  const { isMobile } = useWindowSize();

  // ── State ──────────────────────────────────────────
  const [email,      setEmail]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);

  // Whether the form has been successfully submitted
  // When true we show the success message instead of form
  const [submitted,  setSubmitted]  = useState(false);

  // ── Handle Submit ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email });
      // Show success state regardless of whether
      // the email exists — prevents enumeration
      setSubmitted(true);
    } catch (err) {
      // Even on error show same message for security
      setSubmitted(true);
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
            Forgot your password? No problem.
            We will send you a secure reset link.
          </p>
        </div>
      </div>
      )}

      {/* ── Right Panel ── */}

      <div style={{
                    ...styles.rightPanel,
                    padding: isMobile ? '1.5rem 1rem' : '2rem',}}>

        <div style={styles.formCard}>

          {submitted ? (
            // ── Success State ────────────────────────
            // Show after form submission
            <div style={styles.successState}>
              {/* Email icon */}
              <div style={styles.successIcon}>
                {'📧'}
              </div>
              <h2 style={styles.successTitle}>
                Check Your Email
              </h2>
              <p style={styles.successText}>
                If <strong>{email}</strong> is registered
                in our system you will receive a password
                reset link within a few minutes.
              </p>
              <p style={styles.successNote}>
                The link expires in <strong>60 minutes</strong>.
                Check your spam folder if you do not see it.
              </p>
              {/* Back to login link */}
              <Link to="/login" style={styles.backLink}>
                <ArrowLeft size={15} />
                Back to Login
              </Link>
            </div>

          ) : (
            // ── Request Form ─────────────────────────
            <>
              <div style={styles.formHeader}>
                <h2 style={styles.formTitle}>
                  Reset Password
                </h2>
                <p style={styles.formSubtitle}>
                  Enter your email and we will send
                  you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email input */}
                <div className="form-group">
                  <label className="form-label">
                    Email Address
                  </label>
                  <div style={styles.inputWrap}>
                    <Mail size={16} style={styles.inputIcon} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ width: '100%',
                           marginTop: '0.5rem' }}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"
                        style={{ width: 16, height: 16,
                                 borderWidth: 2 }}
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* Back to login */}
              <div style={styles.backToLogin}>
                <Link to="/login" style={styles.backLink}>
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            </>
          )}
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
    background:'var(--gray-50)',
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
    color:    'white',
    maxWidth: '400px',
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
    fontSize:  '1.125rem',
    opacity:   0.85,
    lineHeight:1.6,
  },
  rightPanel: {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '2rem',
  },
  formCard: {
    width:        '100%',
    maxWidth:     '420px',
    background:   'white',
    borderRadius: '1rem',
    padding:      '2.5rem',
    boxShadow:    '0 10px 25px rgba(0,0,0,0.08)',
    border:       '1px solid var(--gray-200)',
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
    position:      'absolute',
    left:          '0.75rem',
    top:           '50%',
    transform:     'translateY(-50%)',
    color:         'var(--gray-400)',
    pointerEvents: 'none',
  },
  backToLogin: {
    textAlign:  'center',
    marginTop:  '1.5rem',
  },
  backLink: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '0.375rem',
    color:          'var(--primary)',
    fontSize:       '0.875rem',
    fontWeight:     '500',
    textDecoration: 'none',
  },
  successState: {
    textAlign: 'center',
    padding:   '0.5rem 0',
  },
  successIcon: {
    fontSize:     '3.5rem',
    marginBottom: '1rem',
    display:      'block',
  },
  successTitle: {
    fontSize:     '1.5rem',
    fontWeight:   '700',
    color:        'var(--gray-900)',
    marginBottom: '0.75rem',
  },
  successText: {
    color:        'var(--gray-600)',
    fontSize:     '0.9375rem',
    lineHeight:   1.6,
    marginBottom: '1rem',
  },
  successNote: {
    color:        'var(--gray-400)',
    fontSize:     '0.8125rem',
    marginBottom: '1.5rem',
  },
};

export default ForgotPasswordPage;