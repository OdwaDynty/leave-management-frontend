// ─── RESET PASSWORD PAGE ──────────────────────────────
// Public page — accessible via the link in the email
// URL format: /reset-password?token=XXXXX
//
// The page reads the token from the URL query string
// User enters a new password and submits
// On success they are redirected to login

import { useState }            from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { toast }               from 'react-hot-toast';
import { Lock, Eye, EyeOff,
         CheckCircle, Briefcase } from 'lucide-react';
import { resetPassword }       from '../../api/auth';

import useWindowSize from '../../hooks/useWindowSize';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const { isMobile } = useWindowSize();

  // ── Read Token from URL ────────────────────────────
  // The reset link looks like:
  // http://localhost:5173/reset-password?token=abc123
  // We read the token value from the query string
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');

  // ── State ──────────────────────────────────────────
  const [formData,   setFormData]   = useState({
    new_password:     '',
    confirm_password: '',
  });
  const [isLoading,  setIsLoading]  = useState(false);
  const [success,    setSuccess]    = useState(false);

  // Toggle password visibility
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);

  // ── Password Strength Checker ──────────────────────
  // Returns an object with score and feedback
  const checkStrength = (pwd) => {
    const checks = {
      length:   pwd.length >= 8,
      upper:    /[A-Z]/.test(pwd),
      lower:    /[a-z]/.test(pwd),
      number:   /[0-9]/.test(pwd),
      special:  /[^A-Za-z0-9]/.test(pwd),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const strength = checkStrength(formData.new_password);

  // ── Strength Bar Colour ────────────────────────────
  const strengthColor =
    strength.score <= 1 ? '#EF4444' :
    strength.score <= 3 ? '#F59E0B' :
    '#10B981';

  const strengthLabel =
    strength.score <= 1 ? 'Weak' :
    strength.score <= 3 ? 'Fair' :
    strength.score <= 4 ? 'Good' :
    'Strong';

  // ── Handle Submit ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // No token in URL — link is broken
    if (!token) {
      toast.error(
        'Invalid reset link. Please request a new one.'
      );
      return;
    }

    // Passwords must match
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }

    // Minimum 8 characters
    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        token,
        new_password: formData.new_password,
      });

      // Show success state
      setSuccess(true);
      toast.success('Password reset successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to reset password. '
        +  'The link may have expired.';
      toast.error(msg);
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
            Choose a strong password to keep
            your account secure.
          </p>
          {/* Password tips */}
          <div style={styles.tips}>
            {[
              'At least 8 characters',
              'Mix of upper and lowercase letters',
              'At least one number',
              'Special characters recommended',
            ].map((tip, i) => (
              <div key={i} style={styles.tip}>
                <div style={styles.tipDot} />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── Right Panel ── */}

      <div style={{
                    ...styles.rightPanel,
                    padding: isMobile ? '1.5rem 1rem' : '2rem',}}>

        <div style={styles.formCard}>

          {/* No token in URL */}
          {!token ? (
            <div style={styles.errorState}>
              <div style={styles.errorIcon}>{'❌'}</div>
              <h2 style={styles.errorTitle}>
                Invalid Reset Link
              </h2>
              <p style={styles.errorText}>
                This reset link is missing or invalid.
                Please request a new password reset.
              </p>
              <Link
                to="/forgot-password"
                className="btn btn-primary"
                style={{ marginTop: '1rem',
                         display: 'inline-flex' }}
              >
                Request New Link
              </Link>
            </div>

          ) : success ? (
            // ── Success State ────────────────────────
            <div style={styles.successState}>
              <div style={styles.successIconWrap}>
                <CheckCircle size={40} color="#10B981" />
              </div>
              <h2 style={styles.successTitle}>
                Password Reset!
              </h2>
              <p style={styles.successText}>
                Your password has been successfully changed.
                Redirecting you to the login page...
              </p>
              <div style={styles.redirectDots}>
                <div className="spinner"
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <Link to="/login" style={styles.loginLink}>
                Go to Login now
              </Link>
            </div>

          ) : (
            // ── Reset Form ───────────────────────────
            <>
              <div style={styles.formHeader}>
                <h2 style={styles.formTitle}>
                  Set New Password
                </h2>
                <p style={styles.formSubtitle}>
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">
                    New Password
                  </label>
                  <div style={styles.inputWrap}>
                    <Lock size={16} style={styles.inputIcon} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={formData.new_password}
                      onChange={e => setFormData(p => ({
                        ...p,
                        new_password: e.target.value
                      }))}
                      placeholder="Enter new password"
                      className="form-input"
                      style={{
                        paddingLeft:  '2.5rem',
                        paddingRight: '2.5rem',
                      }}
                      autoFocus
                      required
                    />
                    {/* Show/hide password toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={styles.eyeBtn}
                    >
                      {showPass
                        ? <EyeOff size={16} />
                        : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {formData.new_password && (
                    <div style={styles.strengthWrap}>
                      <div style={styles.strengthBar}>
                        <div style={{
                          ...styles.strengthFill,
                          width:     `${(strength.score / 5) * 100}%`,
                          background: strengthColor,
                        }} />
                      </div>
                      <span style={{
                        ...styles.strengthLabel,
                        color: strengthColor,
                      }}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">
                    Confirm Password
                  </label>
                  <div style={styles.inputWrap}>
                    <Lock size={16} style={styles.inputIcon} />
                    <input
                      type={showConf ? 'text' : 'password'}
                      value={formData.confirm_password}
                      onChange={e => setFormData(p => ({
                        ...p,
                        confirm_password: e.target.value
                      }))}
                      placeholder="Confirm new password"
                      className="form-input"
                      style={{
                        paddingLeft:  '2.5rem',
                        paddingRight: '2.5rem',
                        // Red border if passwords do not match
                        borderColor:
                          formData.confirm_password &&
                          formData.confirm_password !==
                          formData.new_password
                            ? '#EF4444' : undefined,
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(!showConf)}
                      style={styles.eyeBtn}
                    >
                      {showConf
                        ? <EyeOff size={16} />
                        : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {formData.confirm_password && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: formData.confirm_password ===
                             formData.new_password
                        ? '#10B981' : '#EF4444',
                      marginTop: '0.25rem',
                      display: 'block',
                    }}>
                      {formData.confirm_password ===
                       formData.new_password
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'
                      }
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    isLoading ||
                    formData.new_password !==
                    formData.confirm_password ||
                    formData.new_password.length < 8
                  }
                  style={{ width: '100%',
                           marginTop: '0.5rem' }}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"
                        style={{ width: 16, height: 16,
                                 borderWidth: 2 }}
                      />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              {/* Back to login */}
              <p style={styles.backLink}>
                Remember it?{' '}
                <Link to="/login">Sign in</Link>
              </p>
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
    fontSize:     '1.125rem',
    opacity:      0.85,
    marginBottom: '2rem',
    lineHeight:   1.6,
  },
  tips: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.75rem',
  },
  tip: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.625rem',
    opacity:    0.85,
    fontSize:   '0.9rem',
  },
  tipDot: {
    width:        '6px',
    height:       '6px',
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
  eyeBtn: {
    position:   'absolute',
    right:      '0.75rem',
    top:        '50%',
    transform:  'translateY(-50%)',
    background: 'transparent',
    border:     'none',
    cursor:     'pointer',
    color:      'var(--gray-400)',
    padding:    0,
    display:    'flex',
  },
  strengthWrap: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
    marginTop:  '0.5rem',
  },
  strengthBar: {
    flex:         1,
    height:       '6px',
    background:   'var(--gray-100)',
    borderRadius: '9999px',
    overflow:     'hidden',
  },
  strengthFill: {
    height:       '100%',
    borderRadius: '9999px',
    transition:   'width 0.3s ease, background 0.3s ease',
  },
  strengthLabel: {
    fontSize:   '0.75rem',
    fontWeight: '600',
    minWidth:   '40px',
  },
  backLink: {
    textAlign:  'center',
    marginTop:  '1.5rem',
    fontSize:   '0.875rem',
    color:      'var(--gray-500)',
  },
  errorState: {
    textAlign: 'center',
    padding:   '1rem 0',
  },
  errorIcon: {
    fontSize:     '3rem',
    marginBottom: '1rem',
    display:      'block',
  },
  errorTitle: {
    fontSize:     '1.5rem',
    fontWeight:   '700',
    color:        'var(--gray-900)',
    marginBottom: '0.75rem',
  },
  errorText: {
    color:     'var(--gray-500)',
    fontSize:  '0.9375rem',
    lineHeight:1.6,
  },
  successState: {
    textAlign: 'center',
    padding:   '1rem 0',
  },
  successIconWrap: {
    width:          '72px',
    height:         '72px',
    background:     '#D1FAE5',
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    margin:         '0 auto 1rem',
  },
  successTitle: {
    fontSize:     '1.75rem',
    fontWeight:   '700',
    color:        'var(--gray-900)',
    marginBottom: '0.75rem',
  },
  successText: {
    color:        'var(--gray-500)',
    fontSize:     '0.9375rem',
    marginBottom: '1.5rem',
    lineHeight:   1.6,
  },
  redirectDots: {
    display:        'flex',
    justifyContent: 'center',
    marginBottom:   '1rem',
  },
  loginLink: {
    color:      'var(--primary)',
    fontWeight: '600',
    fontSize:   '0.875rem',
  },
};

export default ResetPasswordPage;