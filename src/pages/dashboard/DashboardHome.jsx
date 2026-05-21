// ─── DASHBOARD HOME ───────────────────────────────────
// The first page users see after logging in
// Shows different content based on the user's role:
//   Employee    → Their balances + recent requests
//   Manager     → Pending approvals + team summary
//   HR Admin    → Company wide stats + charts

import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend,
} from 'recharts';
import {
  Users, FileText, CheckSquare, Clock,
  TrendingUp, Calendar, AlertCircle, ArrowRight,
} from 'lucide-react';
import { useAuth }              from '../../context/AuthContext';
import { getMyBalances }        from '../../api/leaveBalances';
import { getMyLeaveRequests,
         getPendingApprovals }  from '../../api/leaveRequests';
import { getCompanySummary }    from '../../api/reports';
import { getUpcomingLeave }     from '../../api/reports';
import { format }               from 'date-fns';

import useWindowSize from '../../hooks/useWindowSize';

// ─── STAT CARD ────────────────────────────────────────
// Reusable card showing a single number with label and icon
const StatCard = ({ label, value, icon: Icon,
                    color = '#4F46E5', suffix = '' }) => (
  <div className="card" style={styles.statCard}>
    <div style={styles.statTop}>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>
          {value ?? '—'}
          {suffix && (
            <span style={styles.statSuffix}>{suffix}</span>
          )}
        </p>
      </div>
      {/* Coloured icon background */}
      <div style={{
        ...styles.statIconWrap,
        background: `${color}18`, // 10% opacity of the colour
      }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  </div>
);

// ─── BADGE ────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    {status}
  </span>
);

// ─── COLOURS FOR PIE CHART ────────────────────────────
const PIE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

// ─── MAIN COMPONENT ───────────────────────────────────

const DashboardHome = () => {
  const { isMobile } = useWindowSize();
  const { user, hasRole } = useAuth();

  // ── State ──────────────────────────────────────────
  const [balances,        setBalances]        = useState([]);
  const [myRequests,      setMyRequests]      = useState([]);
  const [pendingApprovals,setPendingApprovals] = useState([]);
  const [companySummary,  setCompanySummary]  = useState(null);
  const [upcomingLeave,   setUpcomingLeave]   = useState([]);
  const [isLoading,       setIsLoading]       = useState(true);

  // ── Fetch Data on Mount ────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Every user sees their own balances and requests
        const [balRes, reqRes] = await Promise.all([
          getMyBalances(),
          getMyLeaveRequests({ year: new Date().getFullYear() }),
        ]);
        setBalances(balRes.data.balances || []);
        setMyRequests(reqRes.data.leave_requests || []);

        // Managers and above also see pending approvals
        if (hasRole(['manager', 'hr_admin', 'super_admin'])) {
          const approvalRes = await getPendingApprovals();
          setPendingApprovals(approvalRes.data.leave_requests || []);
        }

        // HR admins see company wide summary and upcoming leave
        if (hasRole(['hr_admin', 'super_admin'])) {
          const [summaryRes, upcomingRes] = await Promise.all([
            getCompanySummary({ year: new Date().getFullYear() }),
            getUpcomingLeave({ days: 30 }),
          ]);
          setCompanySummary(summaryRes.data);
          setUpcomingLeave(upcomingRes.data.upcoming_leave || []);
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Loading State ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  // ── Calculate Stats from Balances ─────────────────
  const totalEntitled  = balances.reduce(
    (sum, b) => sum + parseFloat(b.entitled_days || 0), 0
  );
  const totalUsed      = balances.reduce(
    (sum, b) => sum + parseFloat(b.used_days || 0), 0
  );
  const totalRemaining = balances.reduce(
    (sum, b) => sum + parseFloat(b.remaining_days || 0), 0
  );
  const pendingCount   = myRequests.filter(
    r => r.status === 'pending'
  ).length;

  // ── Pie Chart Data from Balances ───────────────────
  const pieData = balances.map(b => ({
    name:  b.leave_type_name,
    value: parseFloat(b.remaining_days || 0),
  })).filter(b => b.value > 0);

  // ── Bar Chart Data from Company Summary ───────────
  const barData = companySummary?.leave_by_type?.map(lt => ({
    name:  lt.leave_type.replace(' Leave', ''), // Shorten label
    used:  parseFloat(lt.total_used_days    || 0),
    remaining: parseFloat(lt.total_remaining_days || 0),
  })) || [];

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Welcome Banner ── */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={styles.welcomeTitle}>
            Good {getTimeOfDay()}, {user?.first_name}! 👋
          </h2>
          <p style={styles.welcomeSub}>
            {new Date().toLocaleDateString('en-ZA', {
              weekday: 'long',
              year:    'numeric',
              month:   'long',
              day:     'numeric',
            })}
          </p>
        </div>
        <Link
          to="/dashboard/my-leave"
          className="btn btn-primary"
        >
          <FileText size={16} />
          Apply for Leave
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid',
                    gridTemplateColumns: isMobile
                    ? '1fr 1fr'         // phone: 2 stat cards per row
                    : 'repeat(4, 1fr)', // desktop: all 4 in one row
                    gap: '1rem', }}>

        <StatCard
          label="Total Entitled"
          value={totalEntitled}
          suffix=" days"
          icon={Calendar}
          color="#4F46E5"
        />
        <StatCard
          label="Days Used"
          value={totalUsed}
          suffix=" days"
          icon={TrendingUp}
          color="#F59E0B"
        />
        <StatCard
          label="Days Remaining"
          value={totalRemaining}
          suffix=" days"
          icon={CheckSquare}
          color="#10B981"
        />
        <StatCard
          label="Pending Requests"
          value={pendingCount}
          icon={Clock}
          color="#EF4444"
        />
      </div>

      {/* ── Manager: Pending Approvals Alert ── */}
      {hasRole(['manager', 'hr_admin', 'super_admin']) &&
       pendingApprovals.length > 0 && (
        <div style={styles.alertBanner}>
          <AlertCircle size={18} color="#92400E" />
          <span style={styles.alertText}>
            You have <strong>{pendingApprovals.length}</strong> pending
            leave request{pendingApprovals.length > 1 ? 's' : ''} awaiting
            your approval.
          </span>
          <Link
            to="/dashboard/approvals"
            style={styles.alertLink}
          >
            Review now <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Two Column Section ── */}
      <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                    ? '1fr'     // phone: balances and requests stack vertically
                    : '1fr 1fr',// desktop: side by side
                    gap: '1.5rem',}}>

        {/* ── Left: My Leave Balances ── */}
        <div className="card">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>My Leave Balances</h3>
            <Link
              to="/dashboard/my-balances"
              style={styles.cardLink}
            >
              View all
            </Link>
          </div>

          {balances.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} />
              <p>No balances assigned yet.</p>
              <p style={{ fontSize: '0.8rem' }}>
                Contact HR to assign your leave balances.
              </p>
            </div>
          ) : (
            <div style={styles.balanceList}>
              {balances.map((balance) => {
                // Calculate percentage used for the progress bar
                const pct = balance.entitled_days > 0
                  ? (parseFloat(balance.used_days) /
                     parseFloat(balance.entitled_days)) * 100
                  : 0;

                return (
                  <div key={balance.id} style={styles.balanceItem}>
                    <div style={styles.balanceTop}>
                      <span style={styles.balanceName}>
                        {balance.leave_type_name}
                      </span>
                      <span style={styles.balanceDays}>
                        <strong>
                          {parseFloat(balance.remaining_days)}
                        </strong>
                        /{parseFloat(balance.entitled_days)} days left
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={styles.progressBg}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${Math.min(pct, 100)}%`,
                        background: pct > 80
                          ? '#EF4444'   // Red when almost used up
                          : pct > 50
                          ? '#F59E0B'   // Amber at halfway
                          : '#10B981',  // Green when plenty left
                      }} />
                    </div>
                    <div style={styles.balanceMeta}>
                      <span>{parseFloat(balance.used_days)} used</span>
                      <span>
                        {parseFloat(balance.pending_days)} pending
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mini pie chart of remaining days */}
          {pieData.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} days`, '']}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.75rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Right: Recent Leave Requests ── */}
        <div className="card">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Requests</h3>
            <Link
              to="/dashboard/my-leave"
              style={styles.cardLink}
            >
              View all
            </Link>
          </div>

          {myRequests.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} />
              <p>No leave requests yet.</p>
              <Link
                to="/dashboard/my-leave"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                Apply for Leave
              </Link>
            </div>
          ) : (
            <div style={styles.requestList}>
              {myRequests.slice(0, 5).map((req) => (
                <div key={req.id} style={styles.requestItem}>
                  <div style={styles.requestLeft}>
                    <p style={styles.requestType}>
                      {req.leave_type_name}
                    </p>
                    <p style={styles.requestDates}>
                      {format(new Date(req.start_date), 'dd MMM')}
                      {' → '}
                      {format(new Date(req.end_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div style={styles.requestRight}>
                    <StatusBadge status={req.status} />
                    <p style={styles.requestDays}>
                      {parseFloat(req.days_requested)} day
                      {req.days_requested > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── HR Admin: Company Summary Chart ── */}
      {hasRole(['hr_admin', 'super_admin']) &&
       barData.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              Company Leave Usage — {new Date().getFullYear()}
            </h3>
            <Link
              to="/dashboard/reports"
              style={styles.cardLink}
            >
              Full report
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={barData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--gray-100)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                label={{
                  value: 'Days',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: 'var(--gray-400)' }
                }}
              />
              <Tooltip
                contentStyle={{
                  fontSize:     '0.8rem',
                  borderRadius: '0.5rem',
                  border:       '1px solid var(--gray-200)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.8rem' }}
              />
              <Bar
                dataKey="used"
                name="Used"
                fill="#4F46E5"
                radius={[4,4,0,0]}
              />
              <Bar
                dataKey="remaining"
                name="Remaining"
                fill="#E0E7FF"
                radius={[4,4,0,0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Manager/HR: Upcoming Leave ── */}
      {hasRole(['manager', 'hr_admin', 'super_admin']) &&
       upcomingLeave.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              Upcoming Leave — Next 30 Days
            </h3>
            <Link
              to="/dashboard/calendar"
              style={styles.cardLink}
            >
              View calendar
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {upcomingLeave.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>
                      {item.employee_name}
                    </td>
                    <td>{item.leave_type_name}</td>
                    <td>
                      {format(
                        new Date(item.start_date), 'dd MMM yyyy'
                      )}
                    </td>
                    <td>
                      {format(
                        new Date(item.end_date), 'dd MMM yyyy'
                      )}
                    </td>
                    <td>{parseFloat(item.days_requested)}</td>
                    <td style={{ color: 'var(--gray-500)' }}>
                      {item.department || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

// ─── HELPER: TIME OF DAY ──────────────────────────────
// Returns "Morning", "Afternoon", or "Evening"
// based on the current hour
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
  page: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '1.5rem',
  },
  welcomeBanner: {
    background:    'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    borderRadius:  '1rem',
    padding:       '1.5rem 2rem',
    display:       'flex',
    alignItems:    'center',
    justifyContent:'space-between',
    color:         'white',
  },
  welcomeTitle: {
    fontSize:     '1.5rem',
    fontWeight:   '700',
    color:        'white',
    marginBottom: '0.25rem',
  },
  welcomeSub: {
    opacity:   0.8,
    fontSize:  '0.875rem',
  },


  statsGrid: {
  display:             'grid',
  // 4 columns on desktop, 2 on tablet, 1 on mobile
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap:                 '1rem',
},


  statCard: {
    padding: '1.25rem 1.5rem',
  },
  statTop: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  statLabel: {
    fontSize:     '0.8125rem',
    color:        'var(--gray-500)',
    marginBottom: '0.375rem',
    fontWeight:   '500',
  },
  statValue: {
    fontSize:   '1.75rem',
    fontWeight: '700',
    color:      'var(--gray-900)',
    lineHeight: 1,
  },
  statSuffix: {
    fontSize:   '0.875rem',
    fontWeight: '400',
    color:      'var(--gray-500)',
    marginLeft: '0.25rem',
  },
  statIconWrap: {
    width:          '44px',
    height:         '44px',
    borderRadius:   '0.75rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  alertBanner: {
    background:   '#FEF3C7',
    border:       '1px solid #FCD34D',
    borderRadius: '0.75rem',
    padding:      '1rem 1.25rem',
    display:      'flex',
    alignItems:   'center',
    gap:          '0.75rem',
    color:        '#92400E',
    fontSize:     '0.875rem',
  },
  alertText: {
    flex: 1,
  },
  alertLink: {
    display:     'flex',
    alignItems:  'center',
    gap:         '0.25rem',
    color:       '#92400E',
    fontWeight:  '600',
    fontSize:    '0.875rem',
    whiteSpace:  'nowrap',
  },

  twoCol: {
  display:             'grid',
  // Side by side on desktop, stacked on mobile
  gridTemplateColumns: '1fr 1fr',
  gap:                 '1.5rem',
},

  cardHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '1.25rem',
  },
  cardTitle: {
    fontSize:   '1rem',
    fontWeight: '600',
    color:      'var(--gray-800)',
  },
  cardLink: {
    fontSize:   '0.8125rem',
    color:      'var(--primary)',
    fontWeight: '500',
  },
  balanceList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '1.25rem',
  },
  balanceItem: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.375rem',
  },
  balanceTop: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  balanceName: {
    fontSize:   '0.875rem',
    fontWeight: '600',
    color:      'var(--gray-700)',
  },
  balanceDays: {
    fontSize: '0.8125rem',
    color:    'var(--gray-500)',
  },
  progressBg: {
    height:       '6px',
    background:   'var(--gray-100)',
    borderRadius: '9999px',
    overflow:     'hidden',
  },
  progressFill: {
    height:       '100%',
    borderRadius: '9999px',
    transition:   'width 0.3s ease',
  },
  balanceMeta: {
    display:        'flex',
    justifyContent: 'space-between',
    fontSize:       '0.75rem',
    color:          'var(--gray-400)',
  },
  requestList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.75rem',
  },
  requestItem: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '0.75rem',
    background:     'var(--gray-50)',
    borderRadius:   '0.5rem',
    border:         '1px solid var(--gray-100)',
  },
  requestLeft: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.2rem',
  },
  requestType: {
    fontSize:   '0.875rem',
    fontWeight: '600',
    color:      'var(--gray-700)',
  },
  requestDates: {
    fontSize: '0.75rem',
    color:    'var(--gray-400)',
  },
  requestRight: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'flex-end',
    gap:           '0.25rem',
  },
  requestDays: {
    fontSize: '0.75rem',
    color:    'var(--gray-400)',
  },
};

export default DashboardHome;