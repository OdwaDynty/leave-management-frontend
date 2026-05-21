// ─── REPORTS PAGE ─────────────────────────────────────
// Shows company-wide leave analytics and reports
// Includes charts, tables and key metrics

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend,
} from 'recharts';
import { Users, TrendingUp,
         Calendar, BarChart2 } from 'lucide-react';

import useWindowSize from '../../hooks/useWindowSize';

import { getCompanySummary,

         getTeamOverview,
         getAbsenteeismReport,
         getUpcomingLeave }    from '../../api/reports';

// Month names for the chart
const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

const COLORS = [
  '#4F46E5','#10B981','#F59E0B',
  '#EF4444','#8B5CF6','#EC4899',
];

// ─── STAT CARD ────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card" style={rStyles.statCard}>
    <div style={{
      ...rStyles.statIcon,
      background: `${color}18`,
    }}>
      <Icon size={22} color={color} />
    </div>
    <p style={rStyles.statValue}>{value ?? '—'}</p>
    <p style={rStyles.statLabel}>{label}</p>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────
const ReportsPage = () => {

  const { isMobile } = useWindowSize();

  const [summary,    setSummary]    = useState(null);

  const [team,       setTeam]       = useState([]);
  const [absenteeism,setAbsenteeism]= useState(null);
  const [upcoming,   setUpcoming]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [sumRes, teamRes, absRes, upRes] =
          await Promise.all([
            getCompanySummary({ year }),
            getTeamOverview({ year }),
            getAbsenteeismReport({ year }),
            getUpcomingLeave({ days: 30 }),
          ]);
        setSummary(sumRes.data);
        setTeam(teamRes.data.team || []);
        setAbsenteeism(absRes.data);
        setUpcoming(upRes.data.upcoming_leave || []);
      } catch {
        toast.error('Failed to load reports.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [year]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  // ── Build chart data ───────────────────────────────
  const barData = summary?.leave_by_type?.map(lt => ({
    name:      lt.leave_type.replace(' Leave', ''),
    Used:      parseFloat(lt.total_used_days    || 0),
    Remaining: parseFloat(lt.total_remaining_days || 0),
  })) || [];

  const pieData = summary?.requests_by_status?.map(s => ({
    name:  s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: parseInt(s.total_requests),
  })) || [];

  const monthData = absenteeism?.busiest_months?.map(m => ({
    month: MONTHS[parseInt(m.month) - 1],
    Days:  parseFloat(m.total_days || 0),
  })) || [];

  // ── Totals from summary ────────────────────────────
  const totalUsed    = summary?.leave_by_type?.reduce(
    (s, lt) => s + parseFloat(lt.total_used_days || 0), 0
  ) || 0;
  const totalPending = summary?.requests_by_status?.find(
    s => s.status === 'pending'
  );

  return (
    <div style={rStyles.page}>

      {/* ── Header ── */}
      <div style={rStyles.pageHeader}>
        <div>
          <h2 style={rStyles.pageTitle}>Reports</h2>
          <p style={rStyles.pageSub}>
            Company leave analytics for {year}
          </p>
        </div>
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

      {/* ── Summary Stats ── */}
      
      <div style={{
                  display:             'grid',
                  gridTemplateColumns: isMobile
                  ? '1fr 1fr'
                  : 'repeat(4, 1fr)',
                   gap: '1rem',}}>
        
        <StatCard
          label="Total Employees"
          value={summary?.total_employees}
          icon={Users}
          color="#4F46E5"
        />
        <StatCard
          label="Total Days Taken"
          value={totalUsed}
          icon={TrendingUp}
          color="#10B981"
        />
        <StatCard
          label="Pending Requests"
          value={totalPending?.total_requests || 0}
          icon={Calendar}
          color="#F59E0B"
        />
        <StatCard
          label="Leave Types"
          value={summary?.leave_by_type?.length || 0}
          icon={BarChart2}
          color="#8B5CF6"
        />
      </div>

      {/* ── Two Column Charts ── */}

      <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '1.5rem',}}>

        {/* Bar Chart — usage by leave type */}
        <div className="card">
          <h3 style={rStyles.cardTitle}>
            Leave Usage by Type
          </h3>
          {barData.length === 0 ? (
            <div className="empty-state">
              <p>No data for {year}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}
                margin={{ top: 10, right: 10,
                          left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3"
                  stroke="var(--gray-100)" />
                <XAxis dataKey="name"
                  tick={{ fontSize: 12,
                          fill: 'var(--gray-500)' }} />
                <YAxis
                  tick={{ fontSize: 12,
                          fill: 'var(--gray-500)' }} />
                <Tooltip
                  contentStyle={{ fontSize: '0.8rem',
                    borderRadius: '0.5rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="Used" fill="#4F46E5"
                  radius={[4,4,0,0]} />
                <Bar dataKey="Remaining" fill="#E0E7FF"
                  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — requests by status */}
        <div className="card">
          <h3 style={rStyles.cardTitle}>
            Requests by Status
          </h3>
          {pieData.length === 0 ? (
            <div className="empty-state">
              <p>No data for {year}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i}
                      fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Monthly Trend Chart ── */}
      {monthData.length > 0 && (
        <div className="card">
          <h3 style={rStyles.cardTitle}>
            Monthly Leave Trend
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthData}
              margin={{ top: 10, right: 10,
                        left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3"
                stroke="var(--gray-100)" />
              <XAxis dataKey="month"
                tick={{ fontSize: 12,
                        fill: 'var(--gray-500)' }} />
              <YAxis
                tick={{ fontSize: 12,
                        fill: 'var(--gray-500)' }} />
              <Tooltip
                contentStyle={{ fontSize: '0.8rem',
                  borderRadius: '0.5rem' }} />
              <Bar dataKey="Days" fill="#10B981"
                radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Team Overview Table ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid var(--gray-100)' }}>
          <h3 style={rStyles.cardTitle}>Team Overview</h3>
        </div>
        {team.length === 0 ? (
          <div className="empty-state">
            <p>No team data available</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Days Taken</th>
                </tr>
              </thead>
              <tbody>
                {team.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 500 }}>
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>
                      {emp.department || '—'}
                    </td>
                    <td>{emp.approved_requests}</td>
                    <td>{emp.pending_requests}</td>
                    <td style={{ fontWeight: 600,
                                 color: '#4F46E5' }}>
                      {parseFloat(emp.total_days_taken)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Upcoming Leave Table ── */}
      {upcoming.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--gray-100)' }}>
            <h3 style={rStyles.cardTitle}>
              Upcoming Leave — Next 30 Days
            </h3>
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
                </tr>
              </thead>
              <tbody>
                {upcoming.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>
                      {item.employee_name}
                    </td>
                    <td>{item.leave_type_name}</td>
                    <td>
                      {new Date(item.start_date)
                        .toLocaleDateString('en-ZA')}
                    </td>
                    <td>
                      {new Date(item.end_date)
                        .toLocaleDateString('en-ZA')}
                    </td>
                    <td>{parseFloat(item.days_requested)}</td>
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

const rStyles = {
  page: {
    display: 'flex', flexDirection: 'column', gap: '1.5rem',
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontSize: '1.25rem', fontWeight: '700',
    color: 'var(--gray-900)', marginBottom: '0.25rem',
  },
  pageSub: { fontSize: '0.875rem', color: 'var(--gray-500)' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
  },
  statCard: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center',
    padding: '1.25rem', gap: '0.5rem',
  },
  statIcon: {
    width: '48px', height: '48px', borderRadius: '0.75rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '1.75rem', fontWeight: '800',
    color: 'var(--gray-900)', lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.8125rem', color: 'var(--gray-500)',
    fontWeight: '500',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem', fontWeight: '600',
    color: 'var(--gray-800)', marginBottom: '1.25rem',
  },
};

export default ReportsPage;