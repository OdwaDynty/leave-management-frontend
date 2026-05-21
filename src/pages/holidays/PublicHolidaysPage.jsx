// ─── PUBLIC HOLIDAYS PAGE ─────────────────────────────
// HR admins use this page to:
// 1. Seed South African public holidays automatically
// 2. Add custom holidays
// 3. View all holidays
// 4. Delete holidays

import { useState, useEffect } from 'react';
import { toast }               from 'react-hot-toast';
import { format }              from 'date-fns';
import {
  Sun, Plus, Trash2,
  RefreshCw, Calendar,
} from 'lucide-react';

import useWindowSize from '../../hooks/useWindowSize';

import {
  listHolidays,
  seedHolidays,
  addHoliday,
  deleteHoliday,
} from '../../api/holidays';

// ─── MAIN COMPONENT ───────────────────────────────────
const PublicHolidaysPage = () => {
  const { isMobile } = useWindowSize();
  const [holidays,   setHolidays]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [seeding,    setSeeding]    = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  // New holiday form state
  const [newHoliday, setNewHoliday] = useState({
    name:         '',
    holiday_date: '',
    country_code: 'ZA',
  });
  const [adding, setAdding] = useState(false);

  // ── Fetch Holidays ─────────────────────────────────
  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await listHolidays({ year });
      setHolidays(res.data.holidays || []);
    } catch {
      toast.error('Failed to load holidays.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, [year]);

  // ── Seed SA Holidays ───────────────────────────────
  const handleSeed = async () => {
    if (!window.confirm(
      `Seed all South African public holidays for ${year}?`
    )) return;
    setSeeding(true);
    try {
      const res = await seedHolidays({ year });
      const { inserted, skipped } = res.data;
      toast.success(
        `Added ${inserted} holidays. ${skipped} already existed.`
      );
      fetchHolidays();
    } catch {
      toast.error('Failed to seed holidays.');
    } finally {
      setSeeding(false);
    }
  };

  // ── Add Custom Holiday ─────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.holiday_date) {
      toast.error('Name and date are required.');
      return;
    }
    setAdding(true);
    try {
      await addHoliday(newHoliday);
      toast.success('Holiday added!');
      setShowForm(false);
      setNewHoliday({
        name: '', holiday_date: '', country_code: 'ZA',
      });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.error
        || 'Failed to add holiday.');
    } finally {
      setAdding(false);
    }
  };

  // ── Delete Holiday ─────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from holidays?`))
      return;
    setDeletingId(id);
    try {
      await deleteHoliday(id);
      toast.success(`"${name}" removed.`);
      setHolidays(prev => prev.filter(h => h.id !== id));
    } catch {
      toast.error('Failed to delete holiday.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Group holidays by month ────────────────────────
  const grouped = holidays.reduce((acc, h) => {
    const month = format(new Date(h.holiday_date), 'MMMM');
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  // ── Render ─────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Public Holidays</h2>
          <p style={styles.pageSub}>
            {holidays.length} holidays configured for {year}
          </p>
        </div>

        <div style={{
                      display:  'flex',
                      gap:   '0.75rem',
                      alignItems: 'center',
                      flexWrap:  'wrap',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignSelf: isMobile ? 'stretch' : 'auto',}}>

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

          {/* Seed SA Holidays */}
          <button
            className="btn btn-secondary"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? (
              <>
                <div className="spinner"
                  style={{ width: 14, height: 14,
                           borderWidth: 2 }}
                />
                Seeding...
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                Seed SA Holidays
              </>
            )}
          </button>

          {/* Add Custom Holiday */}
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={15} />
            Add Holiday
          </button>
        </div>
      </div>

      {/* ── Add Holiday Form ── */}
      {showForm && (
        <div className="card">
          <h3 style={styles.formTitle}>Add Custom Holiday</h3>
          <form onSubmit={handleAdd}>
            
            <div style={{
                          display:  'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap:   '1rem',
                          alignItems: isMobile ? 'stretch' : 'flex-start',}}>

              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">
                  Holiday Name{' '}
                  <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={e => setNewHoliday(p => ({
                    ...p, name: e.target.value
                  }))}
                  className="form-input"
                  placeholder="e.g. Company Founding Day"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">
                  Date{' '}
                  <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  value={newHoliday.holiday_date}
                  onChange={e => setNewHoliday(p => ({
                    ...p, holiday_date: e.target.value
                  }))}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div style={styles.formActions}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={adding}
              >
                {adding ? (
                  <>
                    <div className="spinner"
                      style={{ width: 14, height: 14,
                               borderWidth: 2 }}
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Add Holiday
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Holidays List ── */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : holidays.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Sun size={40} />
            <p style={{ fontWeight: 600 }}>
              No holidays for {year}
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Click "Seed SA Holidays" to add all South African
              public holidays automatically.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSeed}
              style={{ marginTop: '0.5rem' }}
            >
              <RefreshCw size={14} />
              Seed SA Holidays for {year}
            </button>
          </div>
        </div>
      ) : (
        // Render grouped by month
        Object.entries(grouped).map(([month, items]) => (
          <div key={month} className="card" style={{ padding: 0 }}>
            {/* Month Header */}
            <div style={styles.monthHeader}>
              <Calendar size={15} color="#4F46E5" />
              <span style={styles.monthTitle}>{month}</span>
              <span style={styles.monthCount}>
                {items.length} holiday
                {items.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Holidays in this month */}
            {items.map((h, i) => (
              <div key={h.id} style={{
                ...styles.holidayRow,
                borderBottom: i < items.length - 1
                  ? '1px solid var(--gray-100)' : 'none',
              }}>
                {/* Date */}
                <div style={styles.dateBox}>
                  <span style={styles.dateDay}>
                    {format(new Date(h.holiday_date), 'd')}
                  </span>
                  <span style={styles.dateMon}>
                    {format(new Date(h.holiday_date), 'MMM')}
                  </span>
                </div>

                {/* Name */}
                <div style={{ flex: 1 }}>
                  <p style={styles.holidayName}>{h.name}</p>
                  <p style={styles.holidayDate}>
                    {format(
                      new Date(h.holiday_date),
                      'EEEE, dd MMMM yyyy'
                    )}
                  </p>
                </div>

                {/* Country Code */}
                <span style={styles.countryCode}>
                  {h.country_code}
                </span>

                {/* Delete */}
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(h.id, h.name)}
                  disabled={deletingId === h.id}
                  title="Remove holiday"
                >
                  {deletingId === h.id ? (
                    <div className="spinner"
                      style={{ width: 14, height: 14,
                               borderWidth: 2 }}
                    />
                  ) : (
                    <Trash2 size={15} color="#EF4444" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ))
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
  headerBtns: {
    display: 'flex', gap: '0.75rem', alignItems: 'center',
  },
  formTitle: {
    fontSize: '1rem', fontWeight: '600',
    color: 'var(--gray-800)', marginBottom: '1.25rem',
  },
  formRow: {
    display: 'flex', gap: '1rem', alignItems: 'flex-start',
  },
  formActions: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '0.75rem', marginTop: '0.5rem',
  },
  monthHeader: {
    display: 'flex', alignItems: 'center',
    gap: '0.625rem', padding: '0.875rem 1.25rem',
    background: 'var(--gray-50)',
    borderBottom: '1px solid var(--gray-100)',
  },
  monthTitle: {
    fontWeight: '700', fontSize: '0.9375rem',
    color: 'var(--gray-700)', flex: 1,
  },
  monthCount: {
    fontSize: '0.75rem', color: 'var(--gray-400)',
  },
  holidayRow: {
    display: 'flex', alignItems: 'center',
    gap: '1rem', padding: '0.875rem 1.25rem',
  },
  dateBox: {
    width: '44px', height: '44px',
    background: '#EEF2FF', borderRadius: '0.625rem',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dateDay: {
    fontSize: '1rem', fontWeight: '800',
    color: '#4F46E5', lineHeight: 1,
  },
  dateMon: {
    fontSize: '0.625rem', color: '#6366F1',
    fontWeight: '600', textTransform: 'uppercase',
  },
  holidayName: {
    fontWeight: '600', fontSize: '0.875rem',
    color: 'var(--gray-800)', marginBottom: '0.125rem',
  },
  holidayDate: {
    fontSize: '0.75rem', color: 'var(--gray-400)',
  },
  countryCode: {
    fontSize: '0.75rem', fontWeight: '700',
    color: 'var(--gray-400)', background: 'var(--gray-100)',
    padding: '2px 8px', borderRadius: '9999px',
  },
  deleteBtn: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: '0.375rem',
    borderRadius: '0.375rem', display: 'flex',
    alignItems: 'center',
  },
};

export default PublicHolidaysPage;