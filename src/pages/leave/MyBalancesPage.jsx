// ─── MY LEAVE BALANCES PAGE ───────────────────────────
// Employees use this page to view their leave entitlements
// Shows all leave types with used, pending and remaining days
// Includes a visual progress bar for each leave type

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { Wallet, TrendingUp,
         Clock, Calendar }     from 'lucide-react';
import { getMyBalances }       from '../../api/leaveBalances';
import useWindowSize from '../../hooks/useWindowSize';
import { Link }                from 'react-router-dom';

// ─── BALANCE CARD ─────────────────────────────────────
// Displays one leave type balance as a detailed card
const BalanceCard = ({ balance }) => {
  const entitled  = parseFloat(balance.entitled_days  || 0);
  const used      = parseFloat(balance.used_days      || 0);
  const pending   = parseFloat(balance.pending_days   || 0);
  const remaining = parseFloat(balance.remaining_days || 0);
  const carriedOver = parseFloat(balance.carried_over_days || 0);

  // Percentage of entitlement used — for the progress bar
  const usedPct    = entitled > 0
    ? Math.min((used / entitled) * 100, 100) : 0;
  const pendingPct = entitled > 0
    ? Math.min((pending / entitled) * 100, 100) : 0;

  // Colour changes based on how much is left
  const progressColor =
    remaining <= 0            ? '#EF4444' : // Red — none left
    remaining <= entitled * 0.2 ? '#F59E0B' : // Amber — low
    '#10B981';                               // Green — plenty

  return (
    <div style={cardStyles.card}>
      {/* ── Card Header ── */}
      <div style={cardStyles.header}>
        <div style={cardStyles.iconWrap}>
          <Wallet size={20} color="#4F46E5" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={cardStyles.title}>
            {balance.leave_type_name}
          </h3>
          <p style={cardStyles.subtitle}>
            {balance.is_paid ? 'Paid leave' : 'Unpaid leave'}
            {balance.allow_half_day && ' · Half days allowed'}
          </p>
        </div>
        {/* Remaining days — big number */}
        <div style={cardStyles.remainingWrap}>
          <span style={{
            ...cardStyles.remainingNum,
            color: progressColor,
          }}>
            {remaining}
          </span>
          <span style={cardStyles.remainingLabel}>
            days left
          </span>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {/* Shows used (solid) + pending (striped) out of entitled */}
      <div style={cardStyles.progressWrap}>
        <div style={cardStyles.progressBg}>
          {/* Used portion */}
          <div style={{
            ...cardStyles.progressUsed,
            width:      `${usedPct}%`,
            background: progressColor,
          }} />
          {/* Pending portion */}
          <div style={{
            ...cardStyles.progressPending,
            width: `${Math.min(pendingPct,
                     100 - usedPct)}%`,
            left:  `${usedPct}%`,
          }} />
        </div>
        <span style={cardStyles.progressLabel}>
          {entitled} days total
        </span>
      </div>

      {/* ── Stats Row ── */}
      <div style={cardStyles.statsRow}>
        <div style={cardStyles.stat}>
          <div style={{
            ...cardStyles.statDot,
            background: progressColor,
          }} />
          <div>
            <p style={cardStyles.statValue}>{used}</p>
            <p style={cardStyles.statLabel}>Used</p>
          </div>
        </div>
        <div style={cardStyles.stat}>
          <div style={{
            ...cardStyles.statDot,
            background: '#F59E0B',
            opacity:    0.5,
          }} />
          <div>
            <p style={cardStyles.statValue}>{pending}</p>
            <p style={cardStyles.statLabel}>Pending</p>
          </div>
        </div>
        <div style={cardStyles.stat}>
          <div style={{
            ...cardStyles.statDot,
            background: '#4F46E5',
          }} />
          <div>
            <p style={cardStyles.statValue}>{entitled}</p>
            <p style={cardStyles.statLabel}>Entitled</p>
          </div>
        </div>
        {carriedOver > 0 && (
          <div style={cardStyles.stat}>
            <div style={{
              ...cardStyles.statDot,
              background: '#8B5CF6',
            }} />
            <div>
              <p style={cardStyles.statValue}>{carriedOver}</p>
              <p style={cardStyles.statLabel}>Carried Over</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const cardStyles = {
  card: {
    background:    'white',
    borderRadius:  '0.75rem',
    border:        '1px solid var(--gray-200)',
    boxShadow:     '0 2px 8px rgba(0,0,0,0.05)',
    padding:       '1.5rem',
    display:       'flex',
    flexDirection: 'column',
    gap:           '1.25rem',
  },
  header: {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        '1rem',
  },
  iconWrap: {
    width:          '44px',
    height:         '44px',
    background:     '#EEF2FF',
    borderRadius:   '0.75rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  title: {
    fontSize:     '1rem',
    fontWeight:   '700',
    color:        'var(--gray-800)',
    marginBottom: '0.2rem',
  },
  subtitle: {
    fontSize: '0.75rem',
    color:    'var(--gray-400)',
  },
  remainingWrap: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'flex-end',
  },
  remainingNum: {
    fontSize:   '2rem',
    fontWeight: '800',
    lineHeight: 1,
  },
  remainingLabel: {
    fontSize:  '0.7rem',
    color:     'var(--gray-400)',
    marginTop: '0.1rem',
  },
  progressWrap: {
    display:        'flex',
    alignItems:     'center',
    gap:            '0.75rem',
  },
  progressBg: {
    flex:         1,
    height:       '10px',
    background:   'var(--gray-100)',
    borderRadius: '9999px',
    overflow:     'hidden',
    position:     'relative',
  },
  progressUsed: {
    position:     'absolute',
    left:         0,
    top:          0,
    height:       '100%',
    borderRadius: '9999px',
    transition:   'width 0.4s ease',
  },
  progressPending: {
    position:     'absolute',
    top:          0,
    height:       '100%',
    background:   'repeating-linear-gradient(45deg, #F59E0B, #F59E0B 3px, transparent 3px, transparent 6px)',
    opacity:      0.6,
    transition:   'width 0.4s ease',
  },
  progressLabel: {
    fontSize:  '0.75rem',
    color:     'var(--gray-400)',
    whiteSpace:'nowrap',
  },
  statsRow: {
    display:   'flex',
    gap:       '1.5rem',
    flexWrap:  'wrap',
  },
  stat: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.5rem',
  },
  statDot: {
    width:        '10px',
    height:       '10px',
    borderRadius: '50%',
    flexShrink:   0,
  },
  statValue: {
    fontSize:     '1rem',
    fontWeight:   '700',
    color:        'var(--gray-800)',
    lineHeight:   1.2,
  },
  statLabel: {
    fontSize: '0.7rem',
    color:    'var(--gray-400)',
  },
};

// ─── MAIN COMPONENT ───────────────────────────────────
const MyBalancesPage = () => {
  const { isMobile } = useWindowSize();
  const [balances,  setBalances]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  // ── Summary Totals ─────────────────────────────────
  const totalEntitled  = balances.reduce(
    (s, b) => s + parseFloat(b.entitled_days  || 0), 0);
  const totalUsed      = balances.reduce(
    (s, b) => s + parseFloat(b.used_days      || 0), 0);
  const totalRemaining = balances.reduce(
    (s, b) => s + parseFloat(b.remaining_days || 0), 0);
  const totalPending   = balances.reduce(
    (s, b) => s + parseFloat(b.pending_days   || 0), 0);

  // ── Fetch Balances ─────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await getMyBalances({ year });
        setBalances(res.data.balances || []);
      } catch {
        toast.error('Failed to load balances.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [year]);

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>My Leave Balances</h2>
          <p style={styles.pageSub}>
            Your leave entitlements for {year}
          </p>
        </div>

        {/* Year Selector */}
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="form-select"
          style={{ width: '120px' }}
        >
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div style={{
                    display:             'grid',
                    gridTemplateColumns: isMobile
                    ? '1fr 1fr'
                    : 'repeat(4, 1fr)',
                    gap: '1rem',}}>
        {[
          { label: 'Total Entitled', value: totalEntitled,
            icon: Calendar,  color: '#4F46E5' },
          { label: 'Days Used',      value: totalUsed,
            icon: TrendingUp, color: '#F59E0B' },
          { label: 'Days Pending',   value: totalPending,
            icon: Clock,      color: '#8B5CF6' },
          { label: 'Days Remaining', value: totalRemaining,
            icon: Wallet,     color: '#10B981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={styles.summaryCard}>
            <div style={{
              ...styles.summaryIcon,
              background: `${color}18`,
            }}>
              <Icon size={20} color={color} />
            </div>
            <p style={styles.summaryValue}>{value}</p>
            <p style={styles.summaryLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Balance Cards ── */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : balances.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Wallet size={40} />
            <p style={{ fontWeight: 600 }}>
              No balances for {year}
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Contact HR to assign your leave balances.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
                      display:             'grid',
                      gridTemplateColumns: isMobile
                      ? '1fr'
                      : 'repeat(auto-fill, minmax(380px, 1fr))',
                      gap: '1.25rem',}}>
                        
          {balances.map(balance => (
            <BalanceCard key={balance.id} balance={balance} />
          ))}
        </div>
      )}

      {/* ── Apply for Leave CTA ── */}
      {balances.length > 0 && (
        <div style={styles.ctaBanner}>
          <div>
            <p style={styles.ctaTitle}>
              Ready to apply for leave?
            </p>
            <p style={styles.ctaSub}>
              You have {totalRemaining} days remaining
              across all leave types.
            </p>
          </div>
          <Link
            to="/dashboard/my-leave"
            className="btn btn-primary"
          >
            Apply for Leave
          </Link>
        </div>
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
  summaryGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 '1rem',
  },
  summaryCard: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    textAlign:      'center',
    padding:        '1.25rem',
    gap:            '0.5rem',
  },
  summaryIcon: {
    width:          '48px',
    height:         '48px',
    borderRadius:   '0.75rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize:   '1.75rem',
    fontWeight: '800',
    color:      'var(--gray-900)',
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: '0.8125rem',
    color:    'var(--gray-500)',
    fontWeight:'500',
  },
  cardsGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap:                 '1.25rem',
  },
  ctaBanner: {
    background:    'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    borderRadius:  '1rem',
    padding:       '1.5rem 2rem',
    display:       'flex',
    alignItems:    'center',
    justifyContent:'space-between',
    color:         'white',
  },
  ctaTitle: {
    fontSize:     '1rem',
    fontWeight:   '700',
    color:        'white',
    marginBottom: '0.25rem',
  },
  ctaSub: {
    fontSize: '0.875rem',
    opacity:  0.8,
  },
};

export default MyBalancesPage;