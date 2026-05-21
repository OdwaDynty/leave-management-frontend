// ─── LEAVE CALENDAR PAGE ──────────────────────────────
// Shows all approved leave for the company in a monthly
// calendar view. Users can see who is off on any given day.
// Managers and HR can plan coverage using this view.

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format, startOfMonth,
         endOfMonth, eachDayOfInterval,
         isSameDay, isToday,
         getDay }              from 'date-fns';
import { ChevronLeft,
         ChevronRight,
         Calendar, Users }     from 'lucide-react';
import { getLeaveCalendar }    from '../../api/leaveRequests';

import useWindowSize from '../../hooks/useWindowSize';

// ─── COLOUR PALETTE ───────────────────────────────────
// Each employee gets a consistent colour based on their
// name so they are easy to identify on the calendar
const EMPLOYEE_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

const getEmployeeColor = (name) => {
  // Generate a consistent index from the name string
  const index = name.split('').reduce(
    (acc, char) => acc + char.charCodeAt(0), 0
  );
  return EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
};

// ─── CALENDAR CELL ────────────────────────────────────
// Renders a single day cell in the calendar grid
const CalendarCell = ({ date, leaves, isCurrentMonth }) => {
  const today    = isToday(date);
  const hasLeave = leaves.length > 0;

  return (
    <div style={{
                  ...cellStyles.cell,
                  minHeight: window.innerWidth <= 768 ? '60px' : '100px',
      background:   today ? '#EEF2FF' : 'white',
      border:       today
        ? '2px solid #4F46E5'
        : '1px solid var(--gray-100)',
      opacity: isCurrentMonth ? 1 : 0.35,
    }}>
      {/* Day Number */}
      <div style={{
        ...cellStyles.dayNum,
        background: today ? '#4F46E5' : 'transparent',
        color:      today ? 'white'   : 'var(--gray-700)',
        borderRadius: today ? '50%'   : '0',
      }}>
        {format(date, 'd')}
      </div>

      {/* Leave entries for this day */}
      <div style={cellStyles.leaveList}>
        {leaves.slice(0, 3).map((leave, i) => {
          const color = getEmployeeColor(leave.employee_name);
          return (
            <div key={i} style={{
              ...cellStyles.leaveEntry,
              background: `${color}18`,
              borderLeft: `3px solid ${color}`,
            }}
              title={`${leave.employee_name} — ${leave.leave_type_name}`}
            >
              <span style={{
                ...cellStyles.leaveName,
                color,
              }}>
                {/* Show first name only to save space */}
                {leave.employee_name.split(' ')[0]}
              </span>
            </div>
          );
        })}

        {/* Show +N more if more than 3 on the same day */}
        {leaves.length > 3 && (
          <div style={cellStyles.moreTag}>
            +{leaves.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

const cellStyles = {
  cell: {
    minHeight: window.innerWidth <= 768 ? '60px' : '100px',
    borderRadius:  '0.5rem',
    padding:       '0.375rem',
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.25rem',
    transition:    'all 0.15s',
  },
  dayNum: {
    width:          '24px',
    height:         '24px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '0.8125rem',
    fontWeight:     '600',
    flexShrink:     0,
  },
  leaveList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.2rem',
    flex:          1,
    overflow:      'hidden',
  },
  leaveEntry: {
    borderRadius: '0.25rem',
    padding:      '1px 4px',
    overflow:     'hidden',
  },
  leaveName: {
    fontSize:     '0.7rem',
    fontWeight:   '600',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    display:      'block',
  },
  moreTag: {
    fontSize:   '0.65rem',
    color:      'var(--gray-400)',
    fontWeight: '500',
    paddingLeft:'0.25rem',
  },
};

// ─── LEGEND ───────────────────────────────────────────
// Shows which colour belongs to which employee
const Legend = ({ employees }) => {
  if (employees.length === 0) return null;
  return (
    <div style={legendStyles.wrap}>
      {employees.map(name => (
        <div key={name} style={legendStyles.item}>
          <div style={{
            ...legendStyles.dot,
            background: getEmployeeColor(name),
          }} />
          <span style={legendStyles.name}>{name}</span>
        </div>
      ))}
    </div>
  );
};

const legendStyles = {
  wrap: {
    display:  'flex',
    flexWrap: 'wrap',
    gap:      '0.75rem',
    padding:  '0.875rem 1.25rem',
    borderTop:'1px solid var(--gray-100)',
  },
  item: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.375rem',
  },
  dot: {
    width:        '10px',
    height:       '10px',
    borderRadius: '50%',
    flexShrink:   0,
  },
  name: {
    fontSize:  '0.8125rem',
    color:     'var(--gray-600)',
    fontWeight:'500',
  },
};

// ─── MAIN COMPONENT ───────────────────────────────────
const CalendarPage = () => {
  const { isMobile } = useWindowSize();
  // Current date being viewed
  const [viewDate,   setViewDate]   = useState(new Date());
  const [leaveData,  setLeaveData]  = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [listView,   setListView]   = useState(false);

  const currentMonth = viewDate.getMonth() + 1;
  const currentYear  = viewDate.getFullYear();

  // ── Fetch Leave for Current Month ─────────────────
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await getLeaveCalendar({
          month: currentMonth,
          year:  currentYear,
        });
        setLeaveData(res.data.calendar || []);
      } catch {
        toast.error('Failed to load calendar.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [currentMonth, currentYear]);

  // ── Navigate Months ────────────────────────────────
  const prevMonth = () => {
    setViewDate(prev => new Date(
      prev.getFullYear(),
      prev.getMonth() - 1,
      1
    ));
  };

  const nextMonth = () => {
    setViewDate(prev => new Date(
      prev.getFullYear(),
      prev.getMonth() + 1,
      1
    ));
  };

  const goToToday = () => setViewDate(new Date());

  // ── Build Calendar Grid ────────────────────────────
  // Get all days in the current month
  const monthStart = startOfMonth(viewDate);
  const monthEnd   = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end:   monthEnd,
  });

  // How many blank cells before the 1st (0=Sun, 1=Mon...)
  // We adjust so Monday is first (subtract 1, wrap Sunday)
  const startPadding = (getDay(monthStart) + 6) % 7;
  const blanksBefore = Array(startPadding).fill(null);

  // ── Get Leaves for a Specific Day ─────────────────
  const getLeavesForDay = (date) => {
    return leaveData.filter(leave => {
      const start = new Date(leave.start_date);
      const end   = new Date(leave.end_date);
      // Include if the date falls within start and end
      return date >= start && date <= end;
    });
  };

  // ── Unique Employees on Leave This Month ──────────
  const employeesOnLeave = [
    ...new Set(leaveData.map(l => l.employee_name))
  ];

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Leave Calendar</h2>
          <p style={styles.pageSub}>
            {leaveData.length > 0
              ? `${employeesOnLeave.length} employee${employeesOnLeave.length !== 1 ? 's' : ''} on leave this month`
              : 'No approved leave this month'}
          </p>
        </div>

        {/* View Toggle — Calendar vs List */}
        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.toggleBtn,
              ...(listView ? {} : styles.toggleBtnActive),
            }}
            onClick={() => setListView(false)}
          >
            <Calendar size={14} />
            Calendar
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(listView ? styles.toggleBtnActive : {}),
            }}
            onClick={() => setListView(true)}
          >
            <Users size={14} />
            List
          </button>
        </div>
      </div>

      {/* ── Month Navigation ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={styles.navBar}>
          {/* Previous Month */}
          <button
            style={styles.navBtn}
            onClick={prevMonth}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Month Title + Today Button */}
          <div style={styles.navCenter}>
            <h3 style={styles.monthTitle}>
              {format(viewDate, 'MMMM yyyy')}
            </h3>
            <button
              style={styles.todayBtn}
              onClick={goToToday}
            >
              Today
            </button>
          </div>

          {/* Next Month */}
          <button
            style={styles.navBtn}
            onClick={nextMonth}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* ── Calendar View ── */}
        {!listView && (
          <>
            {/* Day Headers — Mon to Sun */}
            <div style={styles.dayHeaders}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} style={styles.dayHeader}>{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
              <div className="loading-container"
                style={{ padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : (
              <div style={styles.grid}>
                {/* Blank cells before month starts */}
                {blanksBefore.map((_, i) => (
                  <div key={`blank-${i}`}
                    style={styles.blankCell} />
                ))}

                {/* Day cells */}
                {daysInMonth.map(date => (
                  <CalendarCell
                    key={date.toISOString()}
                    date={date}
                    leaves={getLeavesForDay(date)}
                    isCurrentMonth={true}
                  />
                ))}
              </div>
            )}

            {/* Legend */}
            <Legend employees={employeesOnLeave} />
          </>
        )}

        {/* ── List View ── */}
        {listView && (
          isLoading ? (
            <div className="loading-container"
              style={{ padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : leaveData.length === 0 ? (
            <div className="empty-state"
              style={{ padding: '3rem' }}>
              <Calendar size={40} />
              <p style={{ fontWeight: 600 }}>
                No approved leave in{' '}
                {format(viewDate, 'MMMM yyyy')}
              </p>
            </div>
          ) : (
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
                  {leaveData.map(leave => {
                    const color = getEmployeeColor(
                      leave.employee_name
                    );
                    return (
                      <tr key={leave.id}>
                        <td>
                          <div style={styles.empCell}>
                            {/* Colour dot */}
                            <div style={{
                              width:        '8px',
                              height:       '8px',
                              borderRadius: '50%',
                              background:   color,
                              flexShrink:   0,
                            }} />
                            <span style={{ fontWeight: 600 }}>
                              {leave.employee_name}
                            </span>
                          </div>
                        </td>
                        <td>{leave.leave_type_name}</td>
                        <td>
                          {format(
                            new Date(leave.start_date),
                            'dd MMM yyyy'
                          )}
                        </td>
                        <td>
                          {format(
                            new Date(leave.end_date),
                            'dd MMM yyyy'
                          )}
                        </td>
                        <td>
                          {parseFloat(leave.days_requested)}
                        </td>
                        <td style={{ color: 'var(--gray-500)' }}>
                          {leave.department || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ── Summary Cards ── */}
      {!isLoading && leaveData.length > 0 && (

        <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                      gap: '1rem',}}>

          {/* Employees on leave */}
          <div className="card" style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              <Users size={20} color="#4F46E5" />
            </div>
            <p style={styles.summaryNum}>
              {employeesOnLeave.length}
            </p>
            <p style={styles.summaryLabel}>
              Employees on Leave
            </p>
          </div>

          {/* Total leave days */}
          <div className="card" style={styles.summaryCard}>
            <div style={{
              ...styles.summaryIcon,
              background: '#D1FAE5',
            }}>
              <Calendar size={20} color="#10B981" />
            </div>
            <p style={styles.summaryNum}>
              {leaveData.reduce(
                (s, l) => s + parseFloat(l.days_requested || 0),
                0
              )}
            </p>
            <p style={styles.summaryLabel}>
              Total Days Off
            </p>
          </div>

          {/* Most common leave type */}
          <div className="card" style={styles.summaryCard}>
            <div style={{
              ...styles.summaryIcon,
              background: '#FEF3C7',
            }}>
              <Calendar size={20} color="#F59E0B" />
            </div>
            <p style={{
              ...styles.summaryNum,
              fontSize: '1rem',
            }}>
              {/* Find most frequent leave type */}
              {(() => {
                const counts = leaveData.reduce((acc, l) => {
                  acc[l.leave_type_name] =
                    (acc[l.leave_type_name] || 0) + 1;
                  return acc;
                }, {});
                return Object.entries(counts)
                  .sort((a, b) => b[1] - a[1])[0]?.[0]
                  || '—';
              })()}
            </p>
            <p style={styles.summaryLabel}>
              Most Common Type
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STYLES ───────────────────────────────────────────
const styles = {
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
  viewToggle: {
    display: 'flex', background: 'var(--gray-100)',
    borderRadius: '0.5rem', padding: '0.25rem', gap: '0.25rem',
  },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.4rem 0.875rem', borderRadius: '0.375rem',
    border: 'none', background: 'transparent',
    fontSize: '0.8125rem', fontWeight: '500',
    color: 'var(--gray-500)', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleBtnActive: {
    background: 'white', color: 'var(--gray-800)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  navBar: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--gray-100)',
  },
  navBtn: {
    background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
    borderRadius: '0.5rem', width: '36px', height: '36px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer',
    color: 'var(--gray-600)', transition: 'all 0.15s',
  },
  navCenter: {
    display: 'flex', alignItems: 'center', gap: '0.875rem',
  },
  monthTitle: {
    fontSize: '1.125rem', fontWeight: '700',
    color: 'var(--gray-800)',
  },
  todayBtn: {
    background: 'var(--primary-light)', border: 'none',
    borderRadius: '9999px', padding: '0.25rem 0.875rem',
    fontSize: '0.8125rem', fontWeight: '600',
    color: 'var(--primary)', cursor: 'pointer',
  },
  dayHeaders: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    padding: '0.5rem 0.75rem 0.25rem',
    borderBottom: '1px solid var(--gray-100)',
  },
  dayHeader: {
    textAlign: 'center', fontSize: '0.75rem',
    fontWeight: '600', color: 'var(--gray-400)',
    padding: '0.375rem 0',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.375rem', padding: '0.75rem',
  },
  blankCell: {
    minHeight: '100px',
  },
  empCell: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
  },
  summaryCard: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center',
    padding: '1.25rem', gap: '0.5rem',
  },
  summaryIcon: {
    width: '48px', height: '48px',
    background: '#EEF2FF', borderRadius: '0.75rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  },
  summaryNum: {
    fontSize: '1.75rem', fontWeight: '800',
    color: 'var(--gray-900)', lineHeight: 1,
  },
  summaryLabel: {
    fontSize: '0.8125rem', color: 'var(--gray-500)',
    fontWeight: '500',
  },
};

export default CalendarPage;