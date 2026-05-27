// ─── PRICING PAGE ─────────────────────────────────────
// Shows all subscription plans with pricing and features
// Allows super_admin to upgrade the company plan
//
// PAYMENT FLOW:
//   1. User clicks "Upgrade to [Plan]"
//   2. We call POST /api/billing/initiate
//   3. API returns PayFast form fields and URL
//   4. We create a hidden HTML form and submit it
//   5. Browser redirects to PayFast payment page
//   6. After payment PayFast redirects back here
//   7. URL contains ?payment=success&plan=starter
//   8. We show a success message

import { useState, useEffect }  from 'react';
import { useSearchParams }      from 'react-router-dom';
import { toast }                from 'react-hot-toast';
import { format }               from 'date-fns';
import {
  Check, Zap, Crown,
  Building2, Users,
  CreditCard, AlertCircle,
} from 'lucide-react';
import {
  getPlans,
  getSubscription,
  initiatePayment,
  cancelSubscription,
} from '../../api/billing';
import { useAuth }          from '../../context/AuthContext';
import useWindowSize        from '../../hooks/useWindowSize';

// ─── PLAN DISPLAY ORDER ───────────────────────────────
// Controls the order plans appear on the page
const PLAN_ORDER = [
  'free',
  'starter',
  'professional',
  'enterprise',
];

// ─── PLAN ICONS ───────────────────────────────────────
// Icon shown on each plan card
const PLAN_ICONS = {
  free:         Users,
  starter:      Zap,
  professional: Crown,
  enterprise:   Building2,
};

// ─── PLAN ACCENT COLOURS ──────────────────────────────
// Border and header colour for each plan card
const PLAN_COLOURS = {
  free:         { border: '#E5E7EB', header: '#F9FAFB',
                  accent: '#6B7280' },
  starter:      { border: '#C7D2FE', header: '#EEF2FF',
                  accent: '#4F46E5' },
  professional: { border: '#8B5CF6', header: '#EDE9FE',
                  accent: '#7C3AED' },
  enterprise:   { border: '#FCD34D', header: '#FEF3C7',
                  accent: '#D97706' },
};

// ─── MAIN COMPONENT ───────────────────────────────────
const PricingPage = () => {
  const { user, hasRole } = useAuth();
  const { isMobile }      = useWindowSize();

  // Read URL params — PayFast redirects back with
  // ?payment=success&plan=starter after payment
  const [searchParams] = useSearchParams();
  const paymentResult  = searchParams.get('payment');
  const paidPlan       = searchParams.get('plan');

  // ── State ──────────────────────────────────────────
  const [plans,        setPlans]        = useState({});
  const [subscription, setSubscription] = useState(null);
  const [empCount,     setEmpCount]     = useState(0);
  const [isLoading,    setIsLoading]    = useState(true);
  // Which plan is currently being processed
  const [processingPlan, setProcessingPlan] = useState(null);
  const [cancelling,     setCancelling]     = useState(false);

  // ── Show Payment Result Toast ──────────────────────
  // Runs once when the page loads after PayFast redirect
  useEffect(() => {
    if (paymentResult === 'success' && paidPlan) {
      toast.success(
        `🎉 Welcome to the ${paidPlan} plan! ` +
        `Your subscription is now active.`,
        { duration: 6000 }
      );
    } else if (paymentResult === 'cancelled') {
      toast(
        'Payment was cancelled. Your plan has not changed.',
        { icon: 'ℹ️' }
      );
    }
  }, [paymentResult, paidPlan]);

  // ── Fetch Plans and Subscription ──────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        getPlans(),
        getSubscription(),
      ]);
      setPlans(plansRes.data.plans || {});
      setSubscription(subRes.data.subscription);
      setEmpCount(subRes.data.employee_count || 0);
    } catch (err) {
      toast.error('Failed to load billing information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Handle Plan Upgrade ────────────────────────────
  // Calls the API then submits a hidden form to PayFast
  const handleUpgrade = async (planKey) => {
    // Only super_admin can upgrade
    if (!hasRole('super_admin')) {
      toast.error(
        'Only the company admin can change the plan.'
      );
      return;
    }

    setProcessingPlan(planKey);
    try {
      // Get the PayFast payment fields from our API
      const res = await initiatePayment({ plan: planKey });
      const { payfast_url, payment_data } = res.data;

      // Create a hidden HTML form and submit it
      // This redirects the browser to PayFast
      const form    = document.createElement('form');
      form.method   = 'POST';
      form.action   = payfast_url;
      form.target   = '_self'; // Same tab

      // Add each field as a hidden input
      Object.entries(payment_data).forEach(
        ([key, value]) => {
          const input = document.createElement('input');
          input.type  = 'hidden';
          input.name  = key;
          input.value = String(value);
          form.appendChild(input);
        }
      );

      // Attach to DOM and submit
      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        'Failed to start payment. Please try again.'
      );
      setProcessingPlan(null);
    }
  };

  // ── Handle Cancel ──────────────────────────────────
  const handleCancel = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription?\n\n' +
      'You will be moved to the free plan immediately ' +
      'and limited to 5 employees.'
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      await cancelSubscription();
      toast.success(
        'Subscription cancelled. You are now on the free plan.'
      );
      // Refresh the page data
      fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        'Failed to cancel subscription.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading State ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          Subscription Plans
        </h2>
        <p style={styles.subtitle}>
          Choose the right plan for your team.
          All plans billed monthly in South African Rand.
          Cancel anytime.
        </p>
      </div>

      {/* ── Current Plan Banner ── */}
      {/* Only shown if on a paid plan */}
      {subscription && currentPlan !== 'free' && (
        <div style={styles.currentBanner}>
          <div>
            <p style={styles.currentLabel}>
              Active Subscription
            </p>
            <p style={styles.currentPlanName}>
              {currentPlan.charAt(0).toUpperCase() +
               currentPlan.slice(1)} Plan
            </p>
            {subscription.current_period_end && (
              <p style={styles.currentRenews}>
                Renews{' '}
                {format(
                  new Date(subscription.current_period_end),
                  'dd MMMM yyyy'
                )}
              </p>
            )}
          </div>
          <div style={styles.currentRight}>
            <p style={styles.currentEmpCount}>
              {empCount} /{' '}
              {subscription.max_employees >= 999999
                ? '∞' : subscription.max_employees
              } employees used
            </p>
            {hasRole('super_admin') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  color:       '#EF4444',
                  borderColor: '#EF4444',
                }}
              >
                {cancelling
                  ? 'Cancelling...'
                  : 'Cancel Plan'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Plan Cards Grid ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: isMobile
          ? '1fr'
          : 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
      }}>
        {PLAN_ORDER.map((planKey) => {
          const plan      = plans[planKey];
          if (!plan) return null;

          const colours    = PLAN_COLOURS[planKey];
          const Icon       = PLAN_ICONS[planKey];
          const isCurrent  = currentPlan === planKey;
          const isProcessing = processingPlan === planKey;
          const priceRand  = plan.price_cents === 0
            ? 'Free'
            : `R${(plan.price_cents / 100).toFixed(0)}`;

          return (
            <div key={planKey} style={{
              ...styles.planCard,
              border: isCurrent
                ? `2px solid ${colours.accent}`
                : `1px solid ${colours.border}`,
              // Scale up the most popular plan slightly
              transform: planKey === 'professional' &&
                         !isMobile
                ? 'scale(1.03)' : 'none',
            }}>

              {/* Popular label on Professional plan */}
              {planKey === 'professional' && (
                <div style={styles.popularBadge}>
                  Most Popular
                </div>
              )}

              {/* Current plan indicator */}
              {isCurrent && (
                <div style={{
                  ...styles.popularBadge,
                  background: '#10B981',
                }}>
                  Current Plan
                </div>
              )}

              {/* Plan header */}
              <div style={{
                ...styles.planHeader,
                background: colours.header,
              }}>
                {/* Icon circle */}
                <div style={{
                  ...styles.planIconWrap,
                  border: `1px solid ${colours.border}`,
                }}>
                  <Icon size={20} color={colours.accent} />
                </div>

                {/* Plan name */}
                <h3 style={styles.planName}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div style={styles.priceRow}>
                  <span style={{
                    ...styles.price,
                    color: colours.accent,
                  }}>
                    {priceRand}
                  </span>
                  {plan.price_cents > 0 && (
                    <span style={styles.perMonth}>
                      /month
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={styles.planDesc}>
                  {plan.description}
                </p>
              </div>

              {/* Features list */}
              <div style={styles.features}>
                {(plan.features || []).map(
                  (feature, i) => (
                  <div key={i} style={styles.feature}>
                    <Check
                      size={14}
                      color="#10B981"
                      style={{ flexShrink: 0 }}
                    />
                    <span style={styles.featureText}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action button */}
              <div style={styles.planFooter}>
                {isCurrent ? (
                  // Currently on this plan
                  <button
                    className="btn btn-secondary"
                    disabled
                    style={{
                      width:   '100%',
                      opacity: 0.6,
                    }}
                  >
                    Current Plan
                  </button>

                ) : planKey === 'free' ? (
                  // Free plan — no action needed
                  <button
                    className="btn btn-secondary"
                    disabled
                    style={{ width: '100%' }}
                  >
                    Free Forever
                  </button>

                ) : (
                  // Paid plan — show upgrade button
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpgrade(planKey)}
                    disabled={
                      isProcessing ||
                      !hasRole('super_admin')
                    }
                    style={{
                      width:      '100%',
                      background: colours.accent,
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="spinner"
                          style={{
                            width:       14,
                            height:      14,
                            borderWidth: 2,
                          }}
                        />
                        Redirecting to PayFast...
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}

                {/* Non-admin message */}
                {!hasRole('super_admin') &&
                 planKey !== 'free' &&
                 !isCurrent && (
                  <p style={styles.adminNote}>
                    Contact your admin to upgrade
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sandbox Test Notice ── */}
      <div style={styles.sandboxBox}>
        <AlertCircle size={18} color="#92400E" />
        <div>
          <p style={styles.sandboxTitle}>
            Test Mode — PayFast Sandbox
          </p>
          <p style={styles.sandboxText}>
            Payments are in test mode. No real money is
            charged. Use these sandbox credentials:
          </p>
          <div style={styles.sandboxCreds}>
            <span>
              <strong>Email:</strong>{' '}
              sbtest1@payfast.co.za
            </span>
            <span>
              <strong>Password:</strong> Test@1234
            </span>
            <span>
              <strong>Card:</strong>{' '}
              4000000000000002
            </span>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="card">
        <h3 style={styles.faqTitle}>
          Frequently Asked Questions
        </h3>
        <div style={{
          display:             'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap:                 '1.5rem',
          marginTop:           '1.25rem',
        }}>
          {[
            {
              q: 'Can I upgrade or downgrade at any time?',
              a: 'Yes. Upgrades take effect immediately. Downgrades take effect at the end of your billing period.',
            },
            {
              q: 'What happens if I reach my employee limit?',
              a: 'You will not be able to add new employees until you upgrade your plan. Existing employees are not affected.',
            },
            {
              q: 'Is my payment secure?',
              a: 'Yes. Payments are processed by PayFast — South Africa\'s leading payment gateway. We never store your card details.',
            },
            {
              q: 'What happens when I cancel?',
              a: 'You immediately move to the free plan and are limited to 5 employees. No refunds are issued for the current billing period.',
            },
          ].map((item, i) => (
            <div key={i}>
              <p style={styles.faqQ}>{item.q}</p>
              <p style={styles.faqA}>{item.a}</p>
            </div>
          ))}
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
    gap:           '2rem',
  },
  header: {
    textAlign: 'center',
    maxWidth:  '600px',
    margin:    '0 auto',
  },
  title: {
    fontSize:     '1.875rem',
    fontWeight:   '800',
    color:        'var(--gray-900)',
    marginBottom: '0.75rem',
  },
  subtitle: {
    fontSize:  '1rem',
    color:     'var(--gray-500)',
    lineHeight:1.6,
  },
  currentBanner: {
    background:     'linear-gradient(135deg, #4F46E5, #7C3AED)',
    borderRadius:   '0.75rem',
    padding:        '1.25rem 1.5rem',
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    color:          'white',
    flexWrap:       'wrap',
    gap:            '1rem',
  },
  currentLabel: {
    fontSize:     '0.75rem',
    opacity:      0.8,
    marginBottom: '0.25rem',
    textTransform:'uppercase',
    letterSpacing:'0.05em',
  },
  currentPlanName: {
    fontSize:   '1.25rem',
    fontWeight: '700',
    color:      'white',
  },
  currentRenews: {
    fontSize:  '0.8125rem',
    opacity:   0.75,
    marginTop: '0.25rem',
  },
  currentRight: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'flex-end',
    gap:           '0.75rem',
  },
  currentEmpCount: {
    fontSize:   '0.9375rem',
    fontWeight: '600',
    opacity:    0.9,
  },
  planCard: {
    background:    'white',
    borderRadius:  '1rem',
    overflow:      'hidden',
    position:      'relative',
    display:       'flex',
    flexDirection: 'column',
    boxShadow:     '0 2px 8px rgba(0,0,0,0.06)',
    transition:    'transform 0.2s ease, box-shadow 0.2s ease',
  },
  popularBadge: {
    position:     'absolute',
    top:          '0.875rem',
    right:        '0.875rem',
    background:   '#4F46E5',
    color:        'white',
    fontSize:     '0.6875rem',
    fontWeight:   '700',
    padding:      '3px 10px',
    borderRadius: '9999px',
    zIndex:       1,
  },
  planHeader: {
    padding: '1.5rem',
  },
  planIconWrap: {
    width:          '44px',
    height:         '44px',
    background:     'white',
    borderRadius:   '0.75rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   '1rem',
    boxShadow:      '0 2px 6px rgba(0,0,0,0.08)',
  },
  planName: {
    fontSize:     '1.125rem',
    fontWeight:   '700',
    color:        'var(--gray-900)',
    marginBottom: '0.5rem',
  },
  priceRow: {
    display:     'flex',
    alignItems:  'baseline',
    gap:         '0.25rem',
    marginBottom:'0.25rem',
  },
  price: {
    fontSize:   '2.25rem',
    fontWeight: '800',
    lineHeight: 1,
  },
  perMonth: {
    fontSize: '0.875rem',
    color:    'var(--gray-500)',
  },
  planDesc: {
    fontSize:  '0.8125rem',
    color:     'var(--gray-500)',
    marginTop: '0.25rem',
  },
  features: {
    padding:       '1.25rem 1.5rem',
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.625rem',
  },
  feature: {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        '0.5rem',
  },
  featureText: {
    fontSize:  '0.875rem',
    color:     'var(--gray-700)',
    lineHeight:1.4,
  },
  planFooter: {
    padding:    '1rem 1.5rem',
    borderTop:  '1px solid var(--gray-100)',
    background: 'var(--gray-50)',
  },
  adminNote: {
    fontSize:  '0.75rem',
    color:     'var(--gray-400)',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  sandboxBox: {
    display:      'flex',
    gap:          '0.875rem',
    background:   '#FEF3C7',
    border:       '1px solid #FCD34D',
    borderRadius: '0.75rem',
    padding:      '1.25rem 1.5rem',
    alignItems:   'flex-start',
  },
  sandboxTitle: {
    fontSize:     '0.9375rem',
    fontWeight:   '700',
    color:        '#92400E',
    marginBottom: '0.375rem',
  },
  sandboxText: {
    fontSize:     '0.875rem',
    color:        '#92400E',
    marginBottom: '0.75rem',
  },
  sandboxCreds: {
    display:     'flex',
    gap:         '1.5rem',
    flexWrap:    'wrap',
    fontSize:    '0.875rem',
    color:       '#92400E',
    background:  'white',
    padding:     '0.625rem 1rem',
    borderRadius:'0.5rem',
  },
  faqTitle: {
    fontSize:   '1rem',
    fontWeight: '600',
    color:      'var(--gray-800)',
  },
  faqQ: {
    fontSize:     '0.9375rem',
    fontWeight:   '600',
    color:        'var(--gray-800)',
    marginBottom: '0.375rem',
  },
  faqA: {
    fontSize:  '0.875rem',
    color:     'var(--gray-500)',
    lineHeight:1.6,
  },
};

export default PricingPage;