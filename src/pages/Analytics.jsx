import { useEffect, useState, useCallback, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  ArcElement,
  Title, Tooltip, Legend, Filler,
)

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ─── constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// Hours shown on the Peak Booking chart (6 am – 5 pm = indices 6..17)
const PEAK_HOUR_INDICES = [6,7,8,9,10,11,12,13,14,15,16,17]
const PEAK_HOUR_LABELS  = ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm']

// ─── chart option factories (static, no data dependency) ─────────────────────

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: false,
      grid: { color: '#f5ede8', drawBorder: false },
      ticks: { stepSize: 10, font: { weight: 500 } },
    },
    x: { grid: { display: false }, ticks: { font: { weight: 600 } } },
  },
}

const peakOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f5ede8', drawBorder: false } },
    x: { grid: { display: false } },
  },
}

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Format a trend percentage like "↑ 14% vs last month" */
function monthTrendText(pct) {
  if (pct === null || pct === undefined) return 'No previous data'
  if (pct > 0) return `↑ ${pct}% vs last month`
  if (pct < 0) return `↓ ${Math.abs(pct)}% vs last month`
  return 'Same as last month'
}

function trendClass(pct) {
  if (pct === null || pct === undefined) return 'neutral'
  return pct >= 0 ? 'up' : 'down'
}

function statusClass(status) {
  if (status === 'online') return 'green'
  if (status === 'busy')   return 'yellow'
  return 'red'
}

// ─── component ───────────────────────────────────────────────────────────────

export default function Analytics({ isActive }) {
  const now = new Date()
  const { accessToken } = useContext(AuthContext)
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1) // 1-indexed
  const [selectedYear]  = useState(now.getFullYear())

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/admin/analytics?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` } },
      )
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Unknown error')
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    if (!isActive) return
    fetchAnalytics()
  }, [fetchAnalytics, isActive])

  // ── derived chart data ─────────────────────────────────────────────────────

  /** Line chart – daily trips for selected month */
  const lineData = data
    ? (() => {
        // Show only days that have trips + a few key day labels for readability
        const points = data.dailyTrips
        const labels = points.map(p => String(p.day))
        const values = points.map(p => p.count)
        return {
          labels,
          datasets: [{
            label: 'Trips',
            data: values,
            borderColor: '#fa7528',
            backgroundColor: 'rgba(250,117,40,0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 4,
            pointRadius: 4,
            pointBackgroundColor: '#fa7528',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          }],
        }
      })()
    : { labels: [], datasets: [] }

  /** Bar chart – peak booking hours (6 am – 5 pm) */
  const peakData = data
    ? {
        labels: PEAK_HOUR_LABELS,
        datasets: [{
          label: 'Trips',
          data: PEAK_HOUR_INDICES.map(h => data.peakHours[h]?.count ?? 0),
          backgroundColor: '#fa7528',
          borderRadius: 6,
          barThickness: 28,
        }],
      }
    : { labels: PEAK_HOUR_LABELS, datasets: [] }

  /** Doughnut – completed vs cancelled */
  const donutData = data
    ? {
        labels: ['Completed', 'Cancelled'],
        datasets: [{
          data: [data.completionCounts.completed, data.completionCounts.cancelled],
          backgroundColor: ['#fa7528', '#fca5a5'],
          borderWidth: 0,
          cutout: '70%',
        }],
      }
    : { labels: ['Completed', 'Cancelled'], datasets: [{ data: [0, 0], backgroundColor: ['#fa7528','#fca5a5'], borderWidth: 0, cutout: '70%' }] }

  // ── stat cards ─────────────────────────────────────────────────────────────

  function completionTrendData(curr, prev) {
    if (prev === null || prev === undefined) return { text: 'No previous data', class: 'neutral' }
    const diff = curr - prev
    if (diff > 0) return { text: `↑ ${diff}% vs last month`, class: 'up' }
    if (diff < 0) return { text: `↓ ${Math.abs(diff)}% vs last month`, class: 'down' }
    return { text: 'Same as last month', class: 'neutral' }
  }

  const statCards = data
    ? [
        {
          label: "MONTHLY TRIPS",
          val: data.stats.thisMonthTrips?.toLocaleString() || '0',
          trend: monthTrendText(data.stats.monthTrendPct),
          trendClass: trendClass(data.stats.monthTrendPct),
        },
        {
          label: 'COMPLETION RATE',
          val: `${data.stats.completionRate}%`,
          valClass: 'green',
          trend: completionTrendData(data.stats.completionRate, data.stats.prevCompletionRate).text,
          trendClass: completionTrendData(data.stats.completionRate, data.stats.prevCompletionRate).class,
        },
        {
          label: 'AVG DAILY TRIP',
          val: String(data.stats.avgDailyTrip),
          trend: 'Average per day this month',
          trendClass: 'neutral',
        },
        {
          label: 'PEAK HOUR',
          val: data.stats.peakHour,
          trend: 'Most active window',
          trendClass: 'neutral',
        },
      ]
    : []

  // ── month selector shared ──────────────────────────────────────────────────

  const MonthSelect = ({ value, onChange }) => (
    <select className="filter-select" value={value} onChange={e => onChange(Number(e.target.value))}>
      {MONTH_NAMES.map((m, i) => (
        <option key={m} value={i + 1}>{m}</option>
      ))}
    </select>
  )

  // ── render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
        Loading analytics…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>
        Failed to load analytics: {error}
        <br />
        <button
          onClick={fetchAnalytics}
          style={{ marginTop: 12, cursor: 'pointer', padding: '6px 16px' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* ── Stat cards ── */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-val${s.valClass ? ' ' + s.valClass : ''}`}>{s.val}</div>
            <div className={`stat-trend ${s.trendClass}`}>{s.trend}</div>
            <div className="overview-icon-bg"></div>
          </div>
        ))}
      </div>

      {/* ── Daily Trip line chart ── */}
      <div className="chart-section" style={{ marginBottom: 28 }}>
        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Daily Trip</span>
            <MonthSelect value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <div style={{ height: 340 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* ── Peak Booking Hours bar chart ── */}
      <div className="chart-section" style={{ marginBottom: 28 }}>
        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Peak Booking Hours</span>
          </div>
          <div style={{ height: 320 }}>
            <Bar data={peakData} options={peakOptions} />
          </div>
        </div>
      </div>

      {/* ── Bottom grid: Doughnut + Top Drivers ── */}
      <div className="dash-bottom-grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 28 }}>

        {/* Completed vs Cancelled */}
        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Completed vs Cancelled</span>
            <MonthSelect value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: 300, position: 'relative' }}>
            <div style={{ width: 140, display: 'flex', flexDirection: 'column', gap: 60 }}>
              {[['#fa7528', 'Completed'], ['#fca5a5', 'Cancelled']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 12, background: color, borderRadius: 4 }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, height: '100%', position: 'relative' }}>
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </div>
        </div>

        {/* Most Active Drivers */}
        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Most Active Drivers</span>
            <MonthSelect value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table style={{ fontSize: '0.82rem' }}>
              <thead style={{ background: 'var(--brand-ll)' }}>
                <tr>
                  <th>DRIVER</th>
                  <th style={{ textAlign: 'center' }}>TRIPS</th>
                  <th style={{ textAlign: 'center' }}>RATE</th>
                  <th style={{ textAlign: 'center' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.topDrivers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '16px 0' }}>
                      No driver data for this period
                    </td>
                  </tr>
                )}
                {data.topDrivers.map(d => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{d.trips}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{d.rate}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`badge ${statusClass(d.status)}`}
                        style={{
                          background: 'none',
                          border: `1.2px solid var(--${statusClass(d.status)}-l)`,
                          padding: '2px 10px',
                        }}
                      >
                        <span className="badge-dot"></span> {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}